import { describe, expect, it } from "@effect/vitest"
import worker, { withCors } from "./index"

/**
 * The CORS surface.
 *
 * This is the only thing standing between a deployed `web-next` and an API it
 * cannot read: that app is served from a `workers.dev` origin while the API is
 * routed on the site hostname, so every browser call is cross-origin. It fails
 * quietly — a missing header is a console error and an empty page, not a 500 —
 * so it is asserted here rather than assumed.
 */

/**
 * The slice of `ExecutionContext` the worker uses.
 *
 * Recorded rather than stubbed away, so the cases below can assert that the
 * entry hands its background work to the platform. Without that call the
 * runtime cancels every write still in flight when the response returns, and
 * does it silently.
 */
const fakeContext = () => {
    const waited: Promise<unknown>[] = []

    return {
        waited,
        ctx: { waitUntil: (promise: Promise<unknown>) => waited.push(promise) },
    }
}

describe("CORS", () => {
    it("answers a preflight without reaching the router", async () => {
        // No D1 or upstream is available in a unit test, so this passing at all
        // is also proof that the OPTIONS branch short-circuits before the API
        // handler runs.
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
        // The OPTIONS branch returns before the router, so there is nothing to
        // keep alive. Asserted because the opposite would mean a preflight was
        // reaching the API handler — the thing that test above rules out.
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
        // The response's own headers survive: CORS is additive.
        expect(response.headers.get("content-type")).toBe("application/json")
        expect(response.status).toBe(200)
    })

    it("preserves a non-200 status", () => {
        // A 404 from the router must stay a 404, not become a 200 that a client
        // then tries to decode.
        expect(withCors(new Response(null, { status: 404 })).status).toBe(404)
    })

    it("keeps the body readable", async () => {
        // `new Response(response.body, …)` re-wraps a stream; getting that wrong
        // yields an empty body rather than an error, which a status-only
        // assertion would miss.
        const response = withCors(new Response('{"ok":true}'))

        expect(await response.text()).toBe('{"ok":true}')
    })
})
