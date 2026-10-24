import { describe, expect, it } from "@effect/vitest"
import worker, { withCors } from "./index"

// Record waitUntil so tests can assert background work is handed to the platform.
const fakeContext = () => {
    const waited: Promise<unknown>[] = []

    return {
        waited,
        ctx: { waitUntil: (promise: Promise<unknown>) => waited.push(promise) },
    }
}

describe("CORS", () => {
    it("answers a preflight without reaching the router", async () => {
        // Passing without D1 proves OPTIONS short-circuits before the API handler.
        const { ctx } = fakeContext()

        const response = await worker.fetch(
            new Request("https://api.test/api/v1/search?q=boom", {
                method: "OPTIONS",
                headers: {
                    origin: "https://corehalla-web-next.example.workers.dev",
                    "access-control-request-method": "GET",
                },
            }),
            {},
            ctx,
        )

        expect(response.status).toBe(204)
        expect(response.headers.get("access-control-allow-origin")).toBe("*")
        expect(response.headers.get("access-control-allow-methods")).toContain(
            "GET",
        )
    })

    it("registers no background work for a preflight", async () => {
        const { waited, ctx } = fakeContext()

        await worker.fetch(
            new Request("https://api.test/api/v1/search?q=boom", {
                method: "OPTIONS",
            }),
            {},
            ctx,
        )

        expect(waited).toHaveLength(0)
    })

    it("adds the headers to an ordinary response without losing its own", () => {
        const original = new Response("{}", {
            status: 200,
            headers: { "content-type": "application/json" },
        })

        const response = withCors(original)

        expect(response.headers.get("access-control-allow-origin")).toBe("*")
        expect(response.headers.get("content-type")).toBe("application/json")
        expect(response.headers.get("x-corehalla-contract")).toBe("1")
        expect(response.headers.get("x-corehalla-build")).toBeDefined()
        expect(response.status).toBe(200)
    })

    it("preserves a non-200 status", () => {
        expect(withCors(new Response(null, { status: 404 })).status).toBe(404)
    })

    it("keeps the body readable", async () => {
        // Re-wrapping `response.body` can silently empty the stream.
        const response = withCors(new Response('{"ok":true}'))

        expect(await response.text()).toBe('{"ok":true}')
    })
})
