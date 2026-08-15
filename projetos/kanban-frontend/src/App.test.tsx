import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import App from "@/App"

describe("App", () => {
  it("mantém a auditoria acessível pela navegação mesmo quando a API falha", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")))
    const user = userEvent.setup()
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(<QueryClientProvider client={queryClient}><App /></QueryClientProvider>)

    await user.click(screen.getAllByRole("button", { name: "Configurações" })[0])

    expect(screen.getByRole("heading", { name: "Auditoria da API" })).toBeInTheDocument()
    expect(screen.getByText("Contrato da API Kanban")).toBeInTheDocument()
  })
})
