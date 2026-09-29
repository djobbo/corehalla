import { describe, expect, it } from "vite-plus/test"
import { canonicalPath, resolveEntityId } from "./routeParams"

/**
 * Turning a slug back into an entity id, and a slug-bearing URL back into its
 * canonical form.
 *
 * `canonicalPath` is here because of a real regression: a profile is a layout
 * with tabs, so its loader also runs for `/stats/players/<id>/legends`, and the
 * canonical redirect used to rebuild the URL from the slug alone. That dropped
 * the tab segment — every tab landed on the overview — and it failed *quietly*,
 * because the redirect still resolved. These assertions pin the tail.
 */
describe("resolveEntityId", () => {
    it("reads the id at the head of a slug", () => {
        expect(resolveEntityId("1234-boomie")).toBe(1234)
    })

    it("accepts a bare id, so a link minted before slugs still resolves", () => {
        expect(resolveEntityId("1234")).toBe(1234)
    })

    it("falls back to zero for a segment with no id", () => {
        // The parent route rejects this before a child renders; the child only
        // needs a value it can pass to the atom.
        expect(resolveEntityId("boom")).toBe(0)
    })
})

describe("canonicalPath", () => {
    it("rewrites only the entity segment", () => {
        expect(
            canonicalPath(
                "/stats/players/1234",
                "/stats/players",
                "1234",
                "1234-boomie",
            ),
        ).toBe("/stats/players/1234-boomie")
    })

    it("keeps the tab segment — the regression this exists for", () => {
        expect(
            canonicalPath(
                "/stats/players/1234/legends",
                "/stats/players",
                "1234",
                "1234-boomie",
            ),
        ).toBe("/stats/players/1234-boomie/legends")
    })

    it("keeps an arbitrary tail, including nested segments", () => {
        expect(
            canonicalPath(
                "/stats/guilds/9/something/deeper",
                "/stats/guilds",
                "9",
                "9-the-guild",
            ),
        ).toBe("/stats/guilds/9-the-guild/something/deeper")
    })

    it("falls back to the bare canonical path when the segment does not match", () => {
        // Defensive: a pathname that does not carry the segment we parsed is
        // not one we can safely rewrite, so the entity's own URL is used.
        expect(
            canonicalPath(
                "/somewhere/else",
                "/stats/players",
                "1234",
                "1234-boomie",
            ),
        ).toBe("/stats/players/1234-boomie")
    })
})
