import { describe, expect, it } from "@effect/vitest"
import { isPrivatePath, withNoStore } from "./index"

/**
 * The no-store edge.
 *
 * `/api/v1/me/*` and `/api/v1/auth/*` are the only routes on this worker that
 * read a cookie, so their responses must never be stored by a shared cache. The
 * failure mode is invisible in development — a cache that serves one user's
 * favourites to another looks like a correct response — so the header is
 * asserted here rather than trusted to the platform's defaults.
 */

describe("private paths", () => {
    it("recognises the cookie-bearing groups", () => {
        expect(isPrivatePath("/api/v1/me/session")).toBe(true)
        expect(isPrivatePath("/api/v1/me/favorites")).toBe(true)
        expect(isPrivatePath("/api/v1/auth/discord/callback")).toBe(true)
        expect(isPrivatePath("/api/v1/auth/signout")).toBe(true)
    })

    it("leaves the public ladders cacheable", () => {
        expect(isPrivatePath("/api/v1/rankings/1v1")).toBe(false)
        expect(isPrivatePath("/api/v1/search")).toBe(false)
        // A prefix match must not treat a lookalike as private.
        expect(isPrivatePath("/api/v1/members")).toBe(false)
    })
})

describe("withNoStore", () => {
    it("adds the header without losing the response's own", () => {
        const response = withNoStore(
            new Response("{}", {
                status: 200,
                headers: { "content-type": "application/json" },
            }),
        )

        expect(response.headers.get("cache-control")).toBe("private, no-store")
        expect(response.headers.get("content-type")).toBe("application/json")
    })

    it("keeps the status and the body readable", async () => {
        // `new Response(response.body, …)` re-wraps a stream; getting that wrong
        // yields an empty body rather than an error, which a status-only
        // assertion would miss.
        const response = withNoStore(new Response('{"ok":true}', { status: 401 }))

        expect(response.status).toBe(401)
        expect(await response.text()).toBe('{"ok":true}')
    })
})
