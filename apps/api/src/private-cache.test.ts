import { describe, expect, it } from "@effect/vitest"
import { isPrivatePath, withNoStore } from "./index"

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
        // Re-wrapping `response.body` can silently empty the stream.
        const response = withNoStore(
            new Response('{"ok":true}', { status: 401 }),
        )

        expect(response.status).toBe(401)
        expect(await response.text()).toBe('{"ok":true}')
    })
})
