import { describe, expect, it } from "vitest"
import { DEFAULT_API_ORIGIN, resolveApiOrigin } from "@/lib/config"

describe("resolveApiOrigin", () => {
  it("prioriza a configuração fornecida em runtime", () => {
    expect(resolveApiOrigin(" https://runtime.example.com/ ", "https://build.example.com")).toBe("https://runtime.example.com")
  })

  it("usa a configuração de build quando runtime está vazio", () => {
    expect(resolveApiOrigin("  ", " https://build.example.com/// ")).toBe("https://build.example.com")
  })

  it("usa localhost quando nenhuma configuração foi fornecida", () => {
    expect(resolveApiOrigin()).toBe(DEFAULT_API_ORIGIN)
  })

  it("remove todas as barras ao final da URL", () => {
    expect(resolveApiOrigin("http://localhost:8090////")).toBe("http://localhost:8090")
  })
})
