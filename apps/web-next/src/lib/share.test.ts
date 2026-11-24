import { describe, expect, it } from "@effect/vitest"
import { shareFailure, shareMode, shareUrl } from "./share"

const ORIGIN = "https://corehalla.com"
const PLAYER_PATH = "/stats/players/lopes"
const PROFILE_URL = `${ORIGIN}${PLAYER_PATH}`

describe("shareUrl", () => {
    it("joins an origin and a path with exactly one slash", () => {
        expect(shareUrl(ORIGIN, PLAYER_PATH)).toBe(PROFILE_URL)
        expect(shareUrl(`${ORIGIN}/`, PLAYER_PATH)).toBe(PROFILE_URL)
        expect(shareUrl(ORIGIN, PLAYER_PATH.slice(1))).toBe(PROFILE_URL)
        expect(shareUrl(`${ORIGIN}/`, PLAYER_PATH.slice(1))).toBe(PROFILE_URL)
    })

    it("keeps an id-only slug intact", () => {
        expect(shareUrl(ORIGIN, "/stats/players/2460146")).toBe(
            `${ORIGIN}/stats/players/2460146`,
        )
        expect(shareUrl(ORIGIN, "/stats/guilds/42")).toBe(
            `${ORIGIN}/stats/guilds/42`,
        )
    })

    it("adds nothing after the path", () => {
        expect(shareUrl(ORIGIN, PLAYER_PATH)).toBe(PROFILE_URL)
        expect(shareUrl(ORIGIN, PLAYER_PATH)).not.toMatch(/[?#]/)
    })
})

describe("shareMode", () => {
    it("prefers the share sheet when the capability is present", () => {
        expect(shareMode({ share: () => Promise.resolve() })).toBe("share")
    })

    it("falls back to the clipboard when the capability is absent", () => {
        expect(shareMode({})).toBe("copy")
        expect(shareMode({ share: undefined })).toBe("copy")
        expect(shareMode({ share: "yes" })).toBe("copy")
    })
})

describe("shareFailure", () => {
    it("treats a dismissed share sheet as cancelled, not failed", () => {
        expect(
            shareFailure(new DOMException("Share cancelled", "AbortError")),
        ).toBe("cancelled")
        expect(
            shareFailure(
                Object.assign(new Error("The user aborted a request."), {
                    name: "AbortError",
                }),
            ),
        ).toBe("cancelled")
    })

    it("treats anything else as failed", () => {
        expect(shareFailure(new Error("boom"))).toBe("failed")
        expect(shareFailure(undefined)).toBe("failed")
        expect(shareFailure("AbortError")).toBe("failed")
    })
})
