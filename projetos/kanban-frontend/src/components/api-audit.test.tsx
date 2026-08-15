import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ApiAudit } from "@/components/api-audit"
import { emptyAuditSuite, type AuditSuiteId } from "@/lib/api-audit"

const runAuditSuiteMock = vi.fn()

vi.mock("@/lib/api-audit", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/api-audit")>()
  return { ...original, runAuditSuite: (...args: unknown[]) => runAuditSuiteMock(...args) }
})

describe("ApiAudit", () => {
  beforeEach(() => {
    runAuditSuiteMock.mockReset()
    runAuditSuiteMock.mockImplementation(async (id: AuditSuiteId, onUpdate: (result: ReturnType<typeof emptyAuditSuite>) => void) => {
      const running = { ...emptyAuditSuite(id), status: "running" as const, steps: [{
        id: `${id}-step`, label: "Criar recurso", phase: "test" as const, method: "POST" as const, path: `/${id}`,
        status: "running" as const, expected: "200 e recurso válido", payload: { name: "Fixture" },
      }] }
      onUpdate(running)
      const passed = { ...running, status: "passed" as const, steps: [{ ...running.steps[0], status: "passed" as const, httpStatus: 200, durationMs: 12, response: { id: "ok" }, diagnostic: "Resposta de acordo com o contrato." }] }
      onUpdate(passed)
      return passed
    })
  })

  it("executa as três suítes em ordem e atualiza o resumo", async () => {
    const user = userEvent.setup()
    const onFinished = vi.fn()
    render(<ApiAudit onFinished={onFinished} />)

    await user.click(screen.getByRole("button", { name: "Executar tudo" }))

    await waitFor(() => expect(runAuditSuiteMock).toHaveBeenCalledTimes(3))
    expect(runAuditSuiteMock.mock.calls.map((call) => call[0])).toEqual(["board", "column", "task"])
    expect(screen.getByText("3", { selector: "p.text-xl" })).toBeInTheDocument()
    expect(screen.getAllByText("Aprovada")).toHaveLength(3)
    expect(onFinished).toHaveBeenCalledOnce()
  })

  it("permite execução individual e expõe payload, resposta e diagnóstico nos detalhes", async () => {
    const user = userEvent.setup()
    render(<ApiAudit onFinished={() => undefined} />)

    await user.click(screen.getAllByRole("button", { name: "Executar" })[0])
    const row = await screen.findByText("Criar recurso")
    await user.click(row)

    expect(runAuditSuiteMock).toHaveBeenCalledTimes(1)
    expect(runAuditSuiteMock.mock.calls[0][0]).toBe("board")
    expect(screen.getByText("Payload enviado")).toBeVisible()
    expect(screen.getByText("Resposta recebida")).toBeVisible()
    expect(screen.getByText("Resposta de acordo com o contrato.")).toBeVisible()
  })
})
