import { describe, expect, it } from "vite-plus/test"
import {
    clanHref,
    guildRankingsHref,
    playerHref,
    tierColor,
    tierLabel,
} from "./rankings"
import { parseEntityId } from "@crh/common/helpers/entitySlug"

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

describe("guildRankingsHref", () => {
    it("leaves page one without a segment", () => {
        expect(guildRankingsHref()).toBe("/rankings/guilds")
        expect(guildRankingsHref(1)).toBe("/rankings/guilds")
    })

    it("appends later pages", () => {
        expect(guildRankingsHref(3)).toBe("/rankings/guilds/3")
    })
})

describe("tierLabel", () => {
    it("reads a null tier as the top tier", () => {
        expect(tierLabel(null)).toBe("Valhallan")
    })

    it("keeps an explicit tier unchanged", () => {
        expect(tierLabel("Diamond")).toBe("Diamond")
        expect(tierLabel("Valhallan")).toBe("Valhallan")
    })
})

describe("tierColor", () => {
    it("maps the ladder's tiers onto the palette", () => {
        expect(tierColor("Valhallan")).toBe("var(--color-accentAlt)")
        expect(tierColor("Diamond")).toBe("var(--color-accentVar1)")
    })

    it("falls back to the muted tone for an unrecognised tier", () => {
        expect(tierColor("")).toBe("var(--color-textVar1)")
        expect(tierColor("Gold")).toBe("var(--color-warning)")
    })
})
