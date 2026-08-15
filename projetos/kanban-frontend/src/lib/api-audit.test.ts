import { describe, expect, it, vi } from "vitest"
import { runAuditSuite, type AuditSuiteId } from "@/lib/api-audit"

const BOARD_ID = "11111111-1111-4111-8111-111111111111"
const COLUMN_ID = "22222222-2222-4222-8222-222222222222"
const TASK_ID = "33333333-3333-4333-8333-333333333333"
const EXISTING_BOARD_ID = "99999999-9999-4999-8999-999999999999"

describe("runAuditSuite", () => {
  it.each<AuditSuiteId>(["board", "column", "task"])("aprova o contrato completo de %s e limpa as fixtures", async (suiteId) => {
    const backend = createReferenceBackend()
    const updates = vi.fn()
    const result = await runAuditSuite(suiteId, updates, { fetchImpl: backend.fetch, runId: "happy", timeoutMs: 100 })

    expect(result.status).toBe("passed")
    expect(result.steps.every((step) => step.status === "passed")).toBe(true)
    expect(result.residuals).toEqual([])
    expect(backend.state.boards).toEqual([])
    expect(backend.state.columns).toEqual([])
    expect(backend.state.tasks).toEqual([])
    expect(updates.mock.calls.length).toBeGreaterThan(result.steps.length)
  })

  it("executa o CRUD de quadros na ordem e com os payloads esperados", async () => {
    const backend = createReferenceBackend()
    const result = await runAuditSuite("board", () => undefined, { fetchImpl: backend.fetch, runId: "sequence", timeoutMs: 100 })

    expect(result.steps.map((step) => `${step.method} ${step.path}`)).toEqual([
      "POST /board", "GET /board", `PUT /board/${BOARD_ID}`, "GET /board", `DELETE /board/${BOARD_ID}`, "GET /board",
    ])
    expect(backend.requests[0].body).toEqual({ name: "[AUDIT sequence] Quadro" })
    expect(backend.requests[2].body).toEqual({ name: "[AUDIT sequence] Quadro atualizado" })
  })

  it("preserva dados que não pertencem à auditoria", async () => {
    const backend = createReferenceBackend({ seedExistingBoard: true })
    const result = await runAuditSuite("board", () => undefined, { fetchImpl: backend.fetch, runId: "isolated", timeoutMs: 100 })

    expect(result.status).toBe("passed")
    expect(backend.state.boards).toEqual([{ id: EXISTING_BOARD_ID, name: "Quadro existente" }])
  })

  it("mostra divergência, recupera o ID pela listagem e continua até limpar", async () => {
    const backend = createReferenceBackend({ malformedFirstCreate: true })
    const result = await runAuditSuite("board", () => undefined, { fetchImpl: backend.fetch, runId: "recover", timeoutMs: 100 })

    expect(result.status).toBe("failed")
    expect(result.steps[0]).toMatchObject({ status: "failed", diagnostic: "A API respondeu com um corpo que não é JSON válido." })
    expect(result.steps.some((step) => step.label === "Atualizar quadro" && step.status === "passed")).toBe(true)
    expect(result.residuals).toEqual([])
    expect(backend.state.boards).toEqual([])
  })

  it("recupera o ID de uma fixture de preparação e continua a suíte dependente", async () => {
    const backend = createReferenceBackend({ malformedFirstCreate: true })
    const result = await runAuditSuite("column", () => undefined, { fetchImpl: backend.fetch, runId: "setup-recover", timeoutMs: 100 })

    expect(result.status).toBe("failed")
    expect(result.steps.some((step) => step.label === "Recuperar ID do quadro" && step.status === "passed")).toBe(true)
    expect(result.steps.some((step) => step.label === "Criar coluna" && step.status === "passed")).toBe(true)
    expect(result.residuals).toEqual([])
    expect(backend.state.boards).toEqual([])
  })

  it("ignora etapas dependentes e reporta possível resíduo quando não recupera o ID", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => jsonResponse({ title: "Erro interno" }, 500))
    const fetchImpl = fetchMock as unknown as typeof fetch
    const result = await runAuditSuite("board", () => undefined, { fetchImpl, runId: "residual", timeoutMs: 100 })

    expect(result.status).toBe("failed")
    expect(result.steps.filter((step) => step.status === "skipped")).toHaveLength(4)
    expect(result.steps.some((step) => step.phase === "cleanup")).toBe(true)
    expect(result.residuals).toEqual([expect.objectContaining({ kind: "quadro", name: "[AUDIT residual] Quadro" })])
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === "DELETE")).toBe(false)
  })

  it("encerra requisições travadas pelo timeout e explica a causa", async () => {
    const fetchImpl = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")))
    })) as unknown as typeof fetch
    const result = await runAuditSuite("board", () => undefined, { fetchImpl, runId: "timeout", timeoutMs: 5 })

    expect(result.status).toBe("failed")
    expect(result.steps[0].diagnostic).toContain("não respondeu")
  })
})

interface StoredBoard { id: string; name: string }
interface StoredColumn { id: string; name: string; position: number; boardId: string }
interface StoredTask { id: string; name: string; position: number; createdAt: string; dueDate: string; completed: boolean; tags: string[]; columnId: string }

function createReferenceBackend(options: { malformedFirstCreate?: boolean; seedExistingBoard?: boolean } = {}) {
  const state: { boards: StoredBoard[]; columns: StoredColumn[]; tasks: StoredTask[] } = {
    boards: options.seedExistingBoard ? [{ id: EXISTING_BOARD_ID, name: "Quadro existente" }] : [], columns: [], tasks: [],
  }
  const requests: Array<{ method: string; path: string; body?: unknown }> = []
  let malformedPending = options.malformedFirstCreate ?? false

  const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const method = init?.method ?? "GET"
    const path = new URL(String(input)).pathname.replace("/api/v1", "")
    const body = init?.body ? JSON.parse(String(init.body)) : undefined
    requests.push({ method, path, body })

    if (method === "POST" && path === "/board") {
      const board = { id: BOARD_ID, name: body.name }
      state.boards.push(board)
      if (malformedPending) { malformedPending = false; return new Response("not-json", { status: 200 }) }
      return jsonResponse(board)
    }
    if (method === "GET" && path === "/board") return jsonResponse(state.boards)
    if (method === "PUT" && path === `/board/${BOARD_ID}`) {
      const index = state.boards.findIndex((board) => board.id === BOARD_ID)
      state.boards[index] = { id: BOARD_ID, name: body.name }
      return jsonResponse(state.boards[index])
    }
    if (method === "DELETE" && path === `/board/${BOARD_ID}`) {
      state.boards = state.boards.filter((board) => board.id !== BOARD_ID); state.columns = []; state.tasks = []
      return jsonResponse({ status: "ok" })
    }

    if (method === "POST" && path === "/column") {
      const column = { id: COLUMN_ID, name: body.name, position: body.position, boardId: body.boardId }
      state.columns.push(column)
      return jsonResponse(column)
    }
    if (method === "GET" && path === `/column/from/${BOARD_ID}`) return jsonResponse(state.columns)
    if (method === "PUT" && path === `/column/${COLUMN_ID}`) {
      state.columns[0] = { id: COLUMN_ID, name: body.name, position: body.position, boardId: body.boardId }
      return jsonResponse(state.columns[0])
    }
    if (method === "DELETE" && path === `/column/${COLUMN_ID}`) {
      state.columns = []; state.tasks = []
      return jsonResponse({ status: "ok" })
    }

    if (method === "POST" && path === `/task/from/${COLUMN_ID}`) {
      const task = { id: TASK_ID, ...body }
      state.tasks.push(task)
      return jsonResponse(task)
    }
    if (method === "GET" && path === `/task/from/${COLUMN_ID}`) return jsonResponse(state.tasks)
    if (method === "PUT" && path === `/task/${TASK_ID}`) {
      state.tasks[0] = { id: TASK_ID, ...body }
      return jsonResponse(state.tasks[0])
    }
    if (method === "DELETE" && path === `/task/${TASK_ID}`) {
      state.tasks = []
      return jsonResponse({ status: "ok" })
    }

    return jsonResponse({ status: 404, title: "Não encontrado" }, 404)
  }) as unknown as typeof globalThis.fetch

  return { fetch, state, requests }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })
}
