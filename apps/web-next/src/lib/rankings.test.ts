import { describe, expect, it } from "vite-plus/test"
import { clanHref, playerHref, tierColor } from "./rankings"
import { parseEntityId } from "@crh/common/helpers/entitySlug"

/**
 * The two entity URL builders, and the one property that matters about them.
 *
 * A profile route segment is a canonical slug. A link that spells the bare id
 * looks equivalent and is not: the router sees a different `$id`, so the parent
 * loader redirects (dropping the tab, because the profile is a layout) and the
 * `exact` active check stops matching (so the underline disappears). Both were
 * a real regression, and both come down to "does the link carry the slug the API
 * returned".
 */

describe("playerHref", () => {
    it("uses the slug as the route segment", () => {
        expect(playerHref("1234-boomie")).toBe("/stats/players/1234-boomie")
    })

    it("appends the tab when one is given", () => {
        expect(playerHref("1234-boomie", "legends")).toBe(
            "/stats/players/1234-boomie/legends",
        )
    })

    it("still accepts a bare id, for a link minted before slugs", () => {
        expect(playerHref(1234)).toBe("/stats/players/1234")
    })

    it("produces a segment the route can parse back to the same id", () => {
        // The tab strip's contract: the `$id` in the link must be the entity's
        // canonical segment, so no redirect fires and active matching works.
        const segment = playerHref("1234-boomie", "weapons").split("/")[3]

        expect(parseEntityId(segment)).toBe(1234)
    })
})

describe("clanHref", () => {
    it("uses the slug as the route segment", () => {
        expect(clanHref("9-the-guild")).toBe("/stats/guilds/9-the-guild")
    })

    it("still accepts a bare id", () => {
        expect(clanHref(9)).toBe("/stats/guilds/9")
    })
})

describe("tierColor", () => {
    it("maps the ladder's tiers onto the palette", () => {
        expect(tierColor("Valhallan")).toBe("var(--color-accentAlt)")
        expect(tierColor("Diamond")).toBe("var(--color-accentVar1)")
    })

    it("falls back to the muted tone for an unrecognised tier", () => {
        // Including the empty string an unranked row carries.
        expect(tierColor("")).toBe("var(--color-textVar1)")
        expect(tierColor("Gold")).toBe("var(--color-warning)")
    })
})
