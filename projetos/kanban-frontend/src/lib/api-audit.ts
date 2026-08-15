import { API_ORIGIN, API_URL } from "@/lib/api"

export type AuditSuiteId = "board" | "column" | "task"
export type AuditSuiteStatus = "idle" | "running" | "passed" | "failed"
export type AuditStepStatus = "pending" | "running" | "passed" | "failed" | "skipped"
export type AuditStepPhase = "setup" | "test" | "cleanup"
export type AuditMethod = "GET" | "POST" | "PUT" | "DELETE"

export interface AuditStepResult {
  id: string
  label: string
  phase: AuditStepPhase
  method: AuditMethod
  path: string
  status: AuditStepStatus
  expected: string
  payload?: unknown
  response?: unknown
  httpStatus?: number
  durationMs?: number
  diagnostic?: string
}

export interface AuditResidual {
  kind: "quadro" | "coluna" | "tarefa"
  name: string
  id?: string
  reason: string
}

export interface AuditSuiteResult {
  id: AuditSuiteId
  label: string
  description: string
  status: AuditSuiteStatus
  steps: AuditStepResult[]
  residuals: AuditResidual[]
}

export interface AuditRunOptions {
  fetchImpl?: typeof fetch
  timeoutMs?: number
  runId?: string
}

interface RawAuditResponse {
  status: number
  durationMs: number
  body: unknown
  bodyText: string
  validJson: boolean
}

interface StepExecution {
  raw?: RawAuditResponse
  passed: boolean
}

interface StepDefinition {
  id: string
  label: string
  phase: AuditStepPhase
  method: AuditMethod
  path: string
  expected: string
  payload?: unknown
  acceptedStatuses?: number[]
  validate: (body: unknown) => string | null
}

interface Fixture {
  kind: AuditResidual["kind"]
  name: string
  id?: string
  parentId?: string
  creationAttempted: boolean
  deleted: boolean
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const AUDIT_SUITE_META: Record<AuditSuiteId, Pick<AuditSuiteResult, "label" | "description">> = {
  board: { label: "Quadros", description: "Criação, listagem, atualização e exclusão de um quadro temporário." },
  column: { label: "Colunas", description: "CRUD de coluna usando um quadro temporário como dependência." },
  task: { label: "Tarefas", description: "CRUD completo de tarefa com quadro e coluna temporários." },
}

export function emptyAuditSuite(id: AuditSuiteId): AuditSuiteResult {
  return { id, ...AUDIT_SUITE_META[id], status: "idle", steps: [], residuals: [] }
}

export async function runAuditSuite(
  suiteId: AuditSuiteId,
  onUpdate: (suite: AuditSuiteResult) => void,
  options: AuditRunOptions = {},
): Promise<AuditSuiteResult> {
  const suite: AuditSuiteResult = { ...emptyAuditSuite(suiteId), status: "running" }
  const fetchImpl = options.fetchImpl ?? fetch
  const timeoutMs = options.timeoutMs ?? 10_000
  const runId = sanitizeRunId(options.runId ?? makeRunId())
  let stepIndex = 0

  const emit = () => onUpdate(cloneSuite(suite))
  const execute = async (definition: StepDefinition): Promise<StepExecution> => {
    const step: AuditStepResult = {
      id: `${suiteId}-${stepIndex++}-${definition.id}`,
      label: definition.label,
      phase: definition.phase,
      method: definition.method,
      path: definition.path,
      status: "running",
      expected: definition.expected,
      payload: definition.payload,
    }
    suite.steps.push(step)
    emit()

    try {
      const raw = await auditRequest(fetchImpl, timeoutMs, definition.method, definition.path, definition.payload)
      step.httpStatus = raw.status
      step.durationMs = raw.durationMs
      step.response = raw.validJson ? raw.body : raw.bodyText

      const accepted = definition.acceptedStatuses ?? [200]
      if (!accepted.includes(raw.status)) {
        step.status = "failed"
        step.diagnostic = diagnoseHttp(raw.status, accepted)
      } else if (!raw.validJson) {
        step.status = "failed"
        step.diagnostic = raw.bodyText
          ? "A API respondeu com um corpo que não é JSON válido."
          : "A API respondeu sem o JSON esperado."
      } else {
        const mismatch = definition.validate(raw.body)
        step.status = mismatch ? "failed" : "passed"
        step.diagnostic = mismatch ? `Contrato divergente: ${mismatch}` : "Resposta de acordo com o contrato."
      }
      emit()
      return { raw, passed: step.status === "passed" }
    } catch (error) {
      step.status = "failed"
      step.diagnostic = diagnoseTransport(error, timeoutMs)
      emit()
      return { passed: false }
    }
  }

  const skip = (definition: Omit<StepDefinition, "validate">, reason: string) => {
    suite.steps.push({
      id: `${suiteId}-${stepIndex++}-${definition.id}`,
      label: definition.label,
      phase: definition.phase,
      method: definition.method,
      path: definition.path,
      status: "skipped",
      expected: definition.expected,
      payload: definition.payload,
      diagnostic: reason,
    })
    emit()
  }

  emit()
  try {
    if (suiteId === "board") await runBoardSuite(runId, execute, skip, suite)
    if (suiteId === "column") await runColumnSuite(runId, execute, skip, suite)
    if (suiteId === "task") await runTaskSuite(runId, execute, skip, suite)
  } catch (error) {
    suite.residuals.push({
      kind: suiteId === "board" ? "quadro" : suiteId === "column" ? "coluna" : "tarefa",
      name: `[AUDIT ${runId}]`,
      reason: `A execução foi interrompida por um erro inesperado: ${error instanceof Error ? error.message : "erro desconhecido"}.`,
    })
  }

  suite.status = suite.steps.some((step) => step.status === "failed" || step.status === "skipped") || suite.residuals.length > 0 ? "failed" : "passed"
  emit()
  return cloneSuite(suite)
}

async function runBoardSuite(
  runId: string,
  execute: (definition: StepDefinition) => Promise<StepExecution>,
  skip: (definition: Omit<StepDefinition, "validate">, reason: string) => void,
  suite: AuditSuiteResult,
) {
  const createdName = `[AUDIT ${runId}] Quadro`
  const updatedName = `[AUDIT ${runId}] Quadro atualizado`
  const fixture: Fixture = { kind: "quadro", name: createdName, creationAttempted: true, deleted: false }

  try {
    const created = await execute({
      id: "create-board", label: "Criar quadro", phase: "test", method: "POST", path: "/board",
      payload: { name: createdName }, expected: "200 e quadro com UUID e nome enviado",
      validate: (body) => validateBoard(body, createdName),
    })
    fixture.id = readId(created.raw?.body)

    const listed = await execute({
      id: "list-created-board", label: "Listar quadro criado", phase: "test", method: "GET", path: "/board",
      expected: "200 e lista contendo o quadro criado",
      validate: (body) => validateListContains(body, fixture.id, (item) => validateBoard(item, createdName)),
    })
    if (!fixture.id) fixture.id = findIdByName(listed.raw?.body, createdName)

    if (fixture.id) {
      await execute({
        id: "update-board", label: "Atualizar quadro", phase: "test", method: "PUT", path: `/board/${fixture.id}`,
        payload: { name: updatedName }, expected: "200, mesmo UUID e nome atualizado",
        validate: (body) => validateBoard(body, updatedName, fixture.id),
      })
      fixture.name = updatedName
      await execute({
        id: "list-updated-board", label: "Confirmar atualização", phase: "test", method: "GET", path: "/board",
        expected: "200 e lista contendo os dados atualizados",
        validate: (body) => validateListContains(body, fixture.id, (item) => validateBoard(item, updatedName, fixture.id)),
      })
      await execute({
        id: "delete-board", label: "Excluir quadro", phase: "test", method: "DELETE", path: `/board/${fixture.id}`,
        expected: "200 e { status: \"ok\" }", validate: validateStatusOk,
      })
      const absent = await execute({
        id: "confirm-board-deletion", label: "Confirmar exclusão", phase: "test", method: "GET", path: "/board",
        expected: "200 e lista sem o quadro excluído", validate: (body) => validateListAbsent(body, fixture.id),
      })
      fixture.deleted = absent.passed
    } else {
      skipDependentBoardSteps(skip)
    }
  } finally {
    await cleanupFixtures([fixture], execute, { board: fixture })
    reportResiduals([fixture], suite)
  }
}

async function runColumnSuite(
  runId: string,
  execute: (definition: StepDefinition) => Promise<StepExecution>,
  skip: (definition: Omit<StepDefinition, "validate">, reason: string) => void,
  suite: AuditSuiteResult,
) {
  const board: Fixture = { kind: "quadro", name: `[AUDIT ${runId}] Suporte coluna`, creationAttempted: true, deleted: false }
  const column: Fixture = { kind: "coluna", name: `[AUDIT ${runId}] Coluna`, creationAttempted: false, deleted: false }
  const updatedName = `[AUDIT ${runId}] Coluna atualizada`

  try {
    const boardCreated = await execute({
      id: "setup-board", label: "Preparar quadro temporário", phase: "setup", method: "POST", path: "/board",
      payload: { name: board.name }, expected: "200 e quadro temporário válido", validate: (body) => validateBoard(body, board.name),
    })
    board.id = readId(boardCreated.raw?.body)
    if (!board.id) board.id = await recoverFixture(board, execute, { board }, "setup")

    if (!board.id) {
      skipColumnCrud(skip, "O quadro temporário não retornou um ID utilizável.")
      return
    }

    column.parentId = board.id
    column.creationAttempted = true
    const created = await execute({
      id: "create-column", label: "Criar coluna", phase: "test", method: "POST", path: "/column",
      payload: { name: column.name, position: 0, boardId: board.id }, expected: "200 e coluna relacionada ao quadro temporário",
      validate: (body) => validateColumn(body, column.name, 0, board.id!),
    })
    column.id = readId(created.raw?.body)

    const listed = await execute({
      id: "list-created-column", label: "Listar coluna criada", phase: "test", method: "GET", path: `/column/from/${board.id}`,
      expected: "200 e lista contendo a coluna criada",
      validate: (body) => validateListContains(body, column.id, (item) => validateColumn(item, column.name, 0, board.id!)),
    })
    if (!column.id) column.id = findIdByName(listed.raw?.body, column.name)

    if (column.id) {
      await execute({
        id: "update-column", label: "Atualizar coluna", phase: "test", method: "PUT", path: `/column/${column.id}`,
        payload: { name: updatedName, position: 1, boardId: board.id }, expected: "200, mesmo UUID, nome e posição atualizados",
        validate: (body) => validateColumn(body, updatedName, 1, board.id!, column.id),
      })
      column.name = updatedName
      await execute({
        id: "list-updated-column", label: "Confirmar atualização", phase: "test", method: "GET", path: `/column/from/${board.id}`,
        expected: "200 e lista contendo os dados atualizados",
        validate: (body) => validateListContains(body, column.id, (item) => validateColumn(item, updatedName, 1, board.id!, column.id)),
      })
      await execute({
        id: "delete-column", label: "Excluir coluna", phase: "test", method: "DELETE", path: `/column/${column.id}`,
        expected: "200 e { status: \"ok\" }", validate: validateStatusOk,
      })
      const absent = await execute({
        id: "confirm-column-deletion", label: "Confirmar exclusão", phase: "test", method: "GET", path: `/column/from/${board.id}`,
        expected: "200 e lista sem a coluna excluída", validate: (body) => validateListAbsent(body, column.id),
      })
      column.deleted = absent.passed
    } else {
      skipDependentColumnSteps(skip)
    }
  } finally {
    await cleanupFixtures([column, board], execute, { board, column })
    reportResiduals([column, board], suite)
  }
}

async function runTaskSuite(
  runId: string,
  execute: (definition: StepDefinition) => Promise<StepExecution>,
  skip: (definition: Omit<StepDefinition, "validate">, reason: string) => void,
  suite: AuditSuiteResult,
) {
  const board: Fixture = { kind: "quadro", name: `[AUDIT ${runId}] Suporte tarefa`, creationAttempted: true, deleted: false }
  const column: Fixture = { kind: "coluna", name: `[AUDIT ${runId}] Coluna suporte`, creationAttempted: false, deleted: false }
  const task: Fixture = { kind: "tarefa", name: `[AUDIT ${runId}] Tarefa`, creationAttempted: false, deleted: false }
  const updatedName = `[AUDIT ${runId}] Tarefa atualizada`
  const createdAt = new Date(Math.floor(Date.now() / 1000) * 1000).toISOString()
  const dueDate = new Date(Date.parse(createdAt) + 86_400_000).toISOString()
  const updatedDueDate = new Date(Date.parse(createdAt) + 172_800_000).toISOString()

  try {
    const boardCreated = await execute({
      id: "setup-board", label: "Preparar quadro temporário", phase: "setup", method: "POST", path: "/board",
      payload: { name: board.name }, expected: "200 e quadro temporário válido", validate: (body) => validateBoard(body, board.name),
    })
    board.id = readId(boardCreated.raw?.body)
    if (!board.id) board.id = await recoverFixture(board, execute, { board }, "setup")
    if (!board.id) {
      skipTaskSetupAndCrud(skip, "O quadro temporário não retornou um ID utilizável.")
      return
    }

    column.parentId = board.id
    column.creationAttempted = true
    const columnCreated = await execute({
      id: "setup-column", label: "Preparar coluna temporária", phase: "setup", method: "POST", path: "/column",
      payload: { name: column.name, position: 0, boardId: board.id }, expected: "200 e coluna temporária válida",
      validate: (body) => validateColumn(body, column.name, 0, board.id!),
    })
    column.id = readId(columnCreated.raw?.body)
    if (!column.id) column.id = await recoverFixture(column, execute, { board, column }, "setup")
    if (!column.id) {
      skipTaskCrud(skip, "A coluna temporária não retornou um ID utilizável.")
      return
    }

    task.parentId = column.id
    task.creationAttempted = true
    const createPayload = { name: task.name, position: 0, createdAt, dueDate, completed: false, tags: ["auditoria"], columnId: column.id }
    const created = await execute({
      id: "create-task", label: "Criar tarefa", phase: "test", method: "POST", path: `/task/from/${column.id}`,
      payload: createPayload, expected: "200 e tarefa com todos os campos enviados",
      validate: (body) => validateTask(body, { ...createPayload, columnId: column.id! }),
    })
    task.id = readId(created.raw?.body)

    const listed = await execute({
      id: "list-created-task", label: "Listar tarefa criada", phase: "test", method: "GET", path: `/task/from/${column.id}`,
      expected: "200 e lista contendo a tarefa criada",
      validate: (body) => validateListContains(body, task.id, (item) => validateTask(item, { ...createPayload, columnId: column.id! })),
    })
    if (!task.id) task.id = findIdByName(listed.raw?.body, task.name)

    if (task.id) {
      const updatePayload = { ...createPayload, name: updatedName, dueDate: updatedDueDate, completed: true, tags: ["auditoria", "atualizada"] }
      await execute({
        id: "update-task", label: "Atualizar tarefa", phase: "test", method: "PUT", path: `/task/${task.id}`,
        payload: updatePayload, expected: "200, mesmo UUID e todos os campos atualizados",
        validate: (body) => validateTask(body, { ...updatePayload, columnId: column.id! }, task.id),
      })
      task.name = updatedName
      await execute({
        id: "list-updated-task", label: "Confirmar atualização", phase: "test", method: "GET", path: `/task/from/${column.id}`,
        expected: "200 e lista contendo os dados atualizados",
        validate: (body) => validateListContains(body, task.id, (item) => validateTask(item, { ...updatePayload, columnId: column.id! }, task.id)),
      })
      await execute({
        id: "delete-task", label: "Excluir tarefa", phase: "test", method: "DELETE", path: `/task/${task.id}`,
        expected: "200 e { status: \"ok\" }", validate: validateStatusOk,
      })
      const absent = await execute({
        id: "confirm-task-deletion", label: "Confirmar exclusão", phase: "test", method: "GET", path: `/task/from/${column.id}`,
        expected: "200 e lista sem a tarefa excluída", validate: (body) => validateListAbsent(body, task.id),
      })
      task.deleted = absent.passed
    } else {
      skipDependentTaskSteps(skip)
    }
  } finally {
    await cleanupFixtures([task, column, board], execute, { board, column, task })
    reportResiduals([task, column, board], suite)
  }
}

async function cleanupFixtures(
  fixtures: Fixture[],
  execute: (definition: StepDefinition) => Promise<StepExecution>,
  context: { board?: Fixture; column?: Fixture; task?: Fixture },
) {
  for (const fixture of fixtures) {
    if (!fixture.creationAttempted || fixture.deleted) continue

    if (!fixture.id) {
      const recovered = await recoverFixture(fixture, execute, context)
      if (recovered) fixture.id = recovered
      else continue
    }

    const endpoint = fixture.kind === "quadro" ? `/board/${fixture.id}` : fixture.kind === "coluna" ? `/column/${fixture.id}` : `/task/${fixture.id}`
    const suffix = fixture.kind === "quadro" ? "o" : "a"
    const deleted = await execute({
      id: `cleanup-delete-${fixture.kind}`, label: `Limpar ${fixture.kind} temporári${suffix}`,
      phase: "cleanup", method: "DELETE", path: endpoint, expected: "200 ou 404; o recurso deve deixar de existir",
      acceptedStatuses: [200, 404], validate: (body) => isRecord(body) && (body.status === "ok" || body.status === 404) ? null : "a limpeza não retornou { status: \"ok\" } nem um Problem Detail 404",
    })
    if (!deleted.passed) continue

    const confirmed = await confirmFixtureAbsent(fixture, execute, context)
    fixture.deleted = confirmed
  }
}

async function recoverFixture(
  fixture: Fixture,
  execute: (definition: StepDefinition) => Promise<StepExecution>,
  context: { board?: Fixture; column?: Fixture; task?: Fixture },
  phase: AuditStepPhase = "cleanup",
) {
  const listPath = fixture.kind === "quadro"
    ? "/board"
    : fixture.kind === "coluna" && context.board?.id
      ? `/column/from/${context.board.id}`
      : fixture.kind === "tarefa" && context.column?.id
        ? `/task/from/${context.column.id}`
        : undefined
  if (!listPath) return undefined

  const suffix = fixture.kind === "quadro" ? "o" : "a"
  const result = await execute({
    id: `${phase}-find-${fixture.kind}`, label: `${phase === "setup" ? "Recuperar ID d" : "Localizar "}${phase === "setup" ? suffix : ""}${phase === "setup" ? ` ${fixture.kind}` : `${fixture.kind} temporári${suffix}`}`,
    phase, method: "GET", path: listPath, expected: "200 e lista usada somente para localizar a fixture",
    validate: (body) => Array.isArray(body) ? null : "a resposta da listagem não é um array",
  })
  const recoveredId = findIdByName(result.raw?.body, fixture.name)
  if (!recoveredId && result.passed) fixture.deleted = true
  return recoveredId
}

async function confirmFixtureAbsent(
  fixture: Fixture,
  execute: (definition: StepDefinition) => Promise<StepExecution>,
  context: { board?: Fixture; column?: Fixture; task?: Fixture },
) {
  const listPath = fixture.kind === "quadro"
    ? "/board"
    : fixture.kind === "coluna" && context.board?.id
      ? `/column/from/${context.board.id}`
      : fixture.kind === "tarefa" && context.column?.id
        ? `/task/from/${context.column.id}`
        : undefined
  if (!listPath) return false

  const result = await execute({
    id: `cleanup-confirm-${fixture.kind}`, label: `Confirmar limpeza d${fixture.kind === "quadro" ? "o" : "a"} ${fixture.kind}`,
    phase: "cleanup", method: "GET", path: listPath, expected: "200 e lista sem a fixture temporária",
    validate: (body) => validateListAbsent(body, fixture.id),
  })
  return result.passed
}

function reportResiduals(fixtures: Fixture[], suite: AuditSuiteResult) {
  for (const fixture of fixtures) {
    if (!fixture.creationAttempted || fixture.deleted) continue
    suite.residuals.push({
      kind: fixture.kind,
      name: fixture.name,
      id: fixture.id,
      reason: fixture.id ? "Não foi possível confirmar que o recurso foi removido." : "A criação pode ter ocorrido, mas a API não forneceu um ID e a fixture não pôde ser localizada.",
    })
  }
}

function validateBoard(body: unknown, name: string, id?: string) {
  if (!isRecord(body)) return "a resposta do quadro não é um objeto"
  const idError = validateId(body.id, id)
  if (idError) return idError
  if (body.name !== name) return `esperava name = ${quote(name)}, mas recebeu ${quote(body.name)}`
  return null
}

function validateColumn(body: unknown, name: string, position: number, boardId: string, id?: string) {
  if (!isRecord(body)) return "a resposta da coluna não é um objeto"
  const idError = validateId(body.id, id)
  if (idError) return idError
  if (body.name !== name) return `esperava name = ${quote(name)}, mas recebeu ${quote(body.name)}`
  if (body.position !== position) return `esperava position = ${position}, mas recebeu ${quote(body.position)}`
  if (body.boardId !== boardId) return `esperava boardId = ${quote(boardId)}, mas recebeu ${quote(body.boardId)}`
  return null
}

interface ExpectedTask {
  name: string
  position: number
  createdAt: string
  dueDate: string
  completed: boolean
  tags: string[]
  columnId: string
}

function validateTask(body: unknown, expected: ExpectedTask, id?: string) {
  if (!isRecord(body)) return "a resposta da tarefa não é um objeto"
  const idError = validateId(body.id, id)
  if (idError) return idError
  if (body.name !== expected.name) return `esperava name = ${quote(expected.name)}, mas recebeu ${quote(body.name)}`
  if (body.position !== expected.position) return `esperava position = ${expected.position}, mas recebeu ${quote(body.position)}`
  if (!sameInstant(body.createdAt, expected.createdAt)) return `createdAt deveria representar ${expected.createdAt}`
  if (!sameInstant(body.dueDate, expected.dueDate)) return `dueDate deveria representar ${expected.dueDate}`
  if (body.completed !== expected.completed) return `esperava completed = ${expected.completed}, mas recebeu ${quote(body.completed)}`
  if (!Array.isArray(body.tags) || body.tags.length !== expected.tags.length || body.tags.some((tag, index) => tag !== expected.tags[index])) return `esperava tags = ${quote(expected.tags)}, mas recebeu ${quote(body.tags)}`
  if (body.columnId !== expected.columnId) return `esperava columnId = ${quote(expected.columnId)}, mas recebeu ${quote(body.columnId)}`
  return null
}

function validateStatusOk(body: unknown) {
  return isRecord(body) && body.status === "ok" ? null : "esperava o JSON { status: \"ok\" }"
}

function validateListContains(body: unknown, id: string | undefined, validate: (item: unknown) => string | null) {
  if (!Array.isArray(body)) return "a resposta da listagem não é um array"
  if (!id) return "a criação não retornou um UUID utilizável para localizar o recurso"
  const item = body.find((candidate) => isRecord(candidate) && candidate.id === id)
  if (!item) return `a lista não contém o recurso ${id}`
  return validate(item)
}

function validateListAbsent(body: unknown, id: string | undefined) {
  if (!Array.isArray(body)) return "a resposta da listagem não é um array"
  if (!id) return "não há um ID utilizável para confirmar a exclusão"
  return body.some((candidate) => isRecord(candidate) && candidate.id === id) ? `o recurso ${id} ainda aparece na lista` : null
}

function validateId(value: unknown, expected?: string) {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) return "o campo id não contém um UUID válido"
  if (expected && value !== expected) return `esperava o mesmo id ${expected}, mas recebeu ${value}`
  return null
}

function readId(body: unknown) {
  return isRecord(body) && typeof body.id === "string" && body.id ? body.id : undefined
}

function findIdByName(body: unknown, name: string) {
  if (!Array.isArray(body)) return undefined
  const match = body.find((item) => isRecord(item) && item.name === name)
  return readId(match)
}

function sameInstant(value: unknown, expected: string) {
  return typeof value === "string" && Number.isFinite(Date.parse(value)) && Date.parse(value) === Date.parse(expected)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

async function auditRequest(fetchImpl: typeof fetch, timeoutMs: number, method: AuditMethod, path: string, payload?: unknown): Promise<RawAuditResponse> {
  if (!API_ORIGIN) throw new AuditRequestError("not-configured")
  const controller = new AbortController()
  let timedOut = false
  const timeout = setTimeout(() => { timedOut = true; controller.abort() }, timeoutMs)
  const startedAt = performance.now()
  try {
    const response = await fetchImpl(`${API_URL}${path}`, {
      method,
      signal: controller.signal,
      headers: payload === undefined ? undefined : { "Content-Type": "application/json" },
      body: payload === undefined ? undefined : JSON.stringify(payload),
    })
    const bodyText = await response.text()
    let body: unknown
    let validJson = true
    try { body = JSON.parse(bodyText) } catch { validJson = false; body = undefined }
    return { status: response.status, durationMs: Math.round(performance.now() - startedAt), body, bodyText, validJson }
  } catch (error) {
    if (timedOut) throw new AuditRequestError("timeout")
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

class AuditRequestError extends Error {
  constructor(readonly kind: "timeout" | "not-configured") { super(kind) }
}

function diagnoseHttp(status: number, accepted: number[]) {
  const expected = accepted.join(" ou ")
  if (status === 400) return `A API retornou 400. Confira o payload, os tipos e as validações do endpoint; era esperado ${expected}.`
  if (status === 404) return `A rota ou o recurso não foi encontrado (404); era esperado ${expected}. Confira o prefixo /api/v1 e o mapeamento do endpoint.`
  if (status === 405) return `O método HTTP não é aceito nessa rota (405); era esperado ${expected}.`
  if (status === 415) return `A API rejeitou o Content-Type application/json (415); era esperado ${expected}.`
  if (status >= 500) return `O backend falhou com status ${status}; verifique os logs da aplicação. Era esperado ${expected}.`
  return `A API respondeu com status ${status}, mas o contrato espera ${expected}.`
}

function diagnoseTransport(error: unknown, timeoutMs: number) {
  if (error instanceof AuditRequestError && error.kind === "timeout") return `A API não respondeu em ${Math.round(timeoutMs / 1000)} segundos.`
  if (error instanceof AuditRequestError && error.kind === "not-configured") return "A API não está configurada. Defina VITE_API_URL e gere um novo build do frontend."
  if (error instanceof TypeError) return "Não foi possível alcançar a API. Verifique a URL configurada, se o backend está online e a configuração de CORS. O navegador não informa qual dessas causas bloqueou a requisição."
  if (error instanceof Error && error.name === "AbortError") return "A requisição foi interrompida antes de receber uma resposta."
  return `Falha inesperada ao executar a requisição: ${error instanceof Error ? error.message : "erro desconhecido"}.`
}

function quote(value: unknown) {
  try { return JSON.stringify(value) } catch { return String(value) }
}

function makeRunId() {
  const uuid = globalThis.crypto?.randomUUID?.()
  return (uuid ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`).slice(0, 8)
}

function sanitizeRunId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 16) || "run"
}

function cloneSuite(suite: AuditSuiteResult): AuditSuiteResult {
  return { ...suite, steps: suite.steps.map((step) => ({ ...step })), residuals: suite.residuals.map((residual) => ({ ...residual })) }
}

type Skip = (definition: Omit<StepDefinition, "validate">, reason: string) => void
const skipped = (id: string, label: string, method: AuditMethod, path: string, expected: string, payload?: unknown): Omit<StepDefinition, "validate"> => ({ id, label, phase: "test", method, path, expected, payload })

function skipDependentBoardSteps(skip: Skip) {
  const reason = "A criação/listagem não forneceu um ID utilizável; as etapas dependentes foram ignoradas."
  skip(skipped("update-board", "Atualizar quadro", "PUT", "/board/{id}", "200 e quadro atualizado"), reason)
  skip(skipped("list-updated-board", "Confirmar atualização", "GET", "/board", "Lista contendo os dados atualizados"), reason)
  skip(skipped("delete-board", "Excluir quadro", "DELETE", "/board/{id}", "200 e status ok"), reason)
  skip(skipped("confirm-board-deletion", "Confirmar exclusão", "GET", "/board", "Lista sem o quadro"), reason)
}

function skipColumnCrud(skip: Skip, reason: string) {
  skip(skipped("create-column", "Criar coluna", "POST", "/column", "200 e coluna válida"), reason)
  skip(skipped("list-created-column", "Listar coluna criada", "GET", "/column/from/{boardId}", "Lista contendo a coluna"), reason)
  skipDependentColumnSteps(skip, reason)
}

function skipDependentColumnSteps(skip: Skip, reason = "A criação/listagem não forneceu um ID utilizável; as etapas dependentes foram ignoradas.") {
  skip(skipped("update-column", "Atualizar coluna", "PUT", "/column/{id}", "200 e coluna atualizada"), reason)
  skip(skipped("list-updated-column", "Confirmar atualização", "GET", "/column/from/{boardId}", "Lista contendo os dados atualizados"), reason)
  skip(skipped("delete-column", "Excluir coluna", "DELETE", "/column/{id}", "200 e status ok"), reason)
  skip(skipped("confirm-column-deletion", "Confirmar exclusão", "GET", "/column/from/{boardId}", "Lista sem a coluna"), reason)
}

function skipTaskSetupAndCrud(skip: Skip, reason: string) {
  skip({ ...skipped("setup-column", "Preparar coluna temporária", "POST", "/column", "200 e coluna temporária válida"), phase: "setup" }, reason)
  skipTaskCrud(skip, reason)
}

function skipTaskCrud(skip: Skip, reason: string) {
  skip(skipped("create-task", "Criar tarefa", "POST", "/task/from/{columnId}", "200 e tarefa válida"), reason)
  skip(skipped("list-created-task", "Listar tarefa criada", "GET", "/task/from/{columnId}", "Lista contendo a tarefa"), reason)
  skipDependentTaskSteps(skip, reason)
}

function skipDependentTaskSteps(skip: Skip, reason = "A criação/listagem não forneceu um ID utilizável; as etapas dependentes foram ignoradas.") {
  skip(skipped("update-task", "Atualizar tarefa", "PUT", "/task/{id}", "200 e tarefa atualizada"), reason)
  skip(skipped("list-updated-task", "Confirmar atualização", "GET", "/task/from/{columnId}", "Lista contendo os dados atualizados"), reason)
  skip(skipped("delete-task", "Excluir tarefa", "DELETE", "/task/{id}", "200 e status ok"), reason)
  skip(skipped("confirm-task-deletion", "Confirmar exclusão", "GET", "/task/from/{columnId}", "Lista sem a tarefa"), reason)
}
