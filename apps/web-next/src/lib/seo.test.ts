import { afterEach, describe, expect, it, vi } from "@effect/vitest"
import { legendsMap } from "@crh/bhapi/legends"
import {
    DEFAULT_OG_IMAGE,
    careerLegendTitle,
    careerPlayersTitle,
    careerWeaponTitle,
    guildName,
    guildRankingsTitle,
    guildTitle,
    loadedName,
    ladderTitle,
    playerName,
    playerTabTitle,
    playerTitle,
    powerTitle,
    queueTitle,
    seoTags,
    titleTags,
} from "./seo"
import type { SeoMeta } from "./seo"

type Tags = { readonly meta: readonly SeoMeta[] }

const metaContent = (head: Tags, key: string): string | undefined => {
    for (const tag of head.meta) {
        if ("title" in tag) continue
        if (("name" in tag ? tag.name : tag.property) === key)
            return tag.content
    }
}

const pageTitle = (head: Tags): string | undefined => {
    for (const tag of head.meta) {
        if ("title" in tag) return tag.title
    }
}

afterEach(() => {
    vi.unstubAllEnvs()
})

describe("seoTags", () => {
    const board = (path: string) =>
        seoTags({
            title: "Brawlhalla EU 1v1 rankings",
            description: "Live 1v1 ladder for EU, page 1.",
            path,
        })

    it("links the canonical and og:url to the page path", () => {
        const head = board("/rankings/live/1v1/eu")

        expect(head.links).toEqual([
            { rel: "canonical", href: "/rankings/live/1v1/eu" },
        ])
        expect(metaContent(head, "og:url")).toBe("/rankings/live/1v1/eu")
    })

    it("gives the canonical an origin once a site URL is configured", () => {
        vi.stubEnv("VITE_SITE_URL", "https://corehalla.test/")

        const head = board("/rankings/live/1v1/eu")

        expect(head.links).toEqual([
            {
                rel: "canonical",
                href: "https://corehalla.test/rankings/live/1v1/eu",
            },
        ])
        expect(metaContent(head, "og:url")).toBe(
            "https://corehalla.test/rankings/live/1v1/eu",
        )
    })

    it("suppresses the canonical and marks a noindex page", () => {
        const head = seoTags({
            title: "My favorites • Corehalla",
            description: "Players and guilds saved to this browser.",
            path: "/@me/favorites",
            noindex: true,
        })

        expect(head.links).toEqual([])
        expect(metaContent(head, "robots")).toBe("noindex")
    })

    it("previews with the default social image and a large Twitter card", () => {
        const head = board("/rankings/live/1v1/eu")

        expect(metaContent(head, "og:image")).toBe(DEFAULT_OG_IMAGE)
        expect(metaContent(head, "twitter:card")).toBe("summary_large_image")
        expect(metaContent(head, "og:type")).toBe("website")
        expect(metaContent(head, "og:title")).toBe("Brawlhalla EU 1v1 rankings")
        expect(metaContent(head, "description")).toBe(
            "Live 1v1 ladder for EU, page 1.",
        )
    })

    it("keeps the page segment in the canonical", () => {
        const head = board("/rankings/live/1v1/us-e/2")

        expect(head.links).toEqual([
            { rel: "canonical", href: "/rankings/live/1v1/us-e/2" },
        ])
    })
})

describe("titleTags", () => {
    it("overrides the title and og:title without adding a second canonical", () => {
        const head = titleTags("Mordex — Legends — Brawlhalla player stats")

        expect(pageTitle(head)).toBe(
            "Mordex — Legends — Brawlhalla player stats",
        )
        expect(metaContent(head, "og:title")).toBe(
            "Mordex — Legends — Brawlhalla player stats",
        )
        expect("links" in head).toBe(false)
    })
})

describe("ladderTitle", () => {
    it("names the region and bracket", () => {
        expect(ladderTitle("1v1", "eu")).toBe("Brawlhalla EU 1v1 rankings")
        expect(ladderTitle("2v2", "us-e")).toBe("Brawlhalla US-E 2v2 rankings")
    })

    it("suffixes the page only past the first one", () => {
        expect(ladderTitle("1v1", "eu", 1)).toBe("Brawlhalla EU 1v1 rankings")
        expect(ladderTitle("1v1", "eu", 2)).toBe(
            "Brawlhalla EU 1v1 rankings — page 2",
        )
    })

    it("falls back to the global label for an unknown region", () => {
        expect(
            ladderTitle("1v1", "xx" as Parameters<typeof ladderTitle>[1]),
        ).toBe("Brawlhalla Global 1v1 rankings")
    })
})

describe("powerTitle", () => {
    it("names the mode and region", () => {
        expect(powerTitle("1v1", "NA")).toBe("Brawlhalla NA 1v1 power rankings")
        expect(powerTitle("2v2", "EU", 3)).toBe(
            "Brawlhalla EU 2v2 power rankings — page 3",
        )
    })
})

describe("queueTitle", () => {
    it("names the queues board", () => {
        expect(queueTitle("1v1", "all")).toBe(
            "Brawlhalla Global 1v1 ranked queues",
        )
        expect(queueTitle("3v3", "sea")).toBe(
            "Brawlhalla SEA 3v3 ranked queues",
        )
    })
})

describe("career board titles", () => {
    it("suffixes the player board page", () => {
        expect(careerPlayersTitle()).toBe("Brawlhalla career player rankings")
        expect(careerPlayersTitle(2)).toBe(
            "Brawlhalla career player rankings — page 2",
        )
    })

    it("resolves a legend id to its name", () => {
        const legend = legendsMap[3]

        expect(careerLegendTitle(3)).toBe(
            `Brawlhalla career rankings — ${legend.bio_name}`,
        )
        expect(careerLegendTitle(3, 2)).toBe(
            `Brawlhalla career rankings — ${legend.bio_name} — page 2`,
        )
    })

    it("names the weapon board", () => {
        expect(careerWeaponTitle("Sword")).toBe(
            "Brawlhalla career rankings — Sword",
        )
        expect(careerWeaponTitle("Grapple Hammer", 4)).toBe(
            "Brawlhalla career rankings — Grapple Hammer — page 4",
        )
    })
})

describe("guild titles", () => {
    it("names the guild board and page", () => {
        expect(guildRankingsTitle()).toBe("Brawlhalla guild rankings")
        expect(guildRankingsTitle(3)).toBe("Brawlhalla guild rankings — page 3")
    })

    it("names a guild profile", () => {
        expect(guildTitle("Valkyries")).toBe(
            "Valkyries — Brawlhalla guild stats",
        )
    })
})

describe("profileName", () => {
    it("prefers the loaded display name", () => {
        expect(playerName("MoRdex", "1234-mordex")).toBe("MoRdex")
        expect(guildName("Valkyries", "9-valkyries")).toBe("Valkyries")
    })

    it("rebuilds a readable name from the slug half when nothing loaded", () => {
        expect(playerName(undefined, "1234-mordex")).toBe("Mordex")
        expect(guildName(undefined, "9-the-valkyries")).toBe("The Valkyries")
    })

    it("still names an id-only slug", () => {
        expect(playerTitle(playerName(undefined, "1234"))).toBe(
            "Player 1234 — Brawlhalla player stats",
        )
        expect(guildTitle(guildName(undefined, "9"))).toBe(
            "Guild 9 — Brawlhalla guild stats",
        )
    })

    it("never renders undefined", () => {
        expect(playerTitle(playerName(undefined, ""))).not.toContain(
            "undefined",
        )
    })
})

describe("loadedName", () => {
    it("reads the name the profile layout already loaded", () => {
        expect(
            loadedName([
                { loaderData: { dehydrated: [], degraded: false } },
                {
                    loaderData: {
                        dehydrated: [],
                        degraded: false,
                        name: "MoRdex",
                    },
                },
            ]),
        ).toBe("MoRdex")
    })

    it("returns nothing when no match carries a name", () => {
        expect(loadedName([{ loaderData: { degraded: true } }])).toBeUndefined()
    })
})

describe("playerTabTitle", () => {
    it("names the player and the tab", () => {
        expect(playerTabTitle("Mordex", "Legends")).toBe(
            "Mordex — Legends — Brawlhalla player stats",
        )
    })

    it("gives every tab its own title", () => {
        const tabs = ["2v2 Ranked", "Legends", "Weapons", "Esports"].map(
            (tab) => playerTabTitle("Mordex", tab),
        )

        expect(new Set([playerTitle("Mordex"), ...tabs]).size).toBe(5)
    })
})
