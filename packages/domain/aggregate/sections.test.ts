import { describe, expect, it } from "@effect/vitest"
import { clanMock } from "@crh/bhapi/mocks/clan"
import { playerRankedMock } from "@crh/bhapi/mocks/playerRanked"
import { playerStatsMock } from "@crh/bhapi/mocks/playerStats"
import {
    buildPlayer,
    buildPlayerClan,
    buildPlayerLegends,
    buildPlayerProfile,
    buildPlayerTeams,
    buildPlayerWeapons,
} from "./player"

const sources = {
    stats: playerStatsMock,
    ranked: playerRankedMock,
    ranked3v3: null,
    aliases: ["Old Name"],
}

const composed = buildPlayer({ ...sources, clan: clanMock }, 1)

describe("section builders reconstruct the composed view", () => {
    it("legends and weapons are the composed rows", () => {
        expect(buildPlayerLegends(sources)).toEqual(composed.data.legends)
        expect(buildPlayerWeapons(sources)).toEqual(composed.data.weapons)
    })

    it("the lazy teams section is the composed 2v2 record", () => {
        expect(buildPlayerTeams(sources.ranked)).toEqual(
            composed.data.ranked?.["2v2"],
        )
    })

    it("the lazy clan section is the composed card", () => {
        expect(
            buildPlayerClan(
                sources.stats.clan,
                sources.stats.brawlhalla_id,
                clanMock,
            ),
        ).toEqual(composed.data.clan)
    })

    it("the profile carries everything except the lazy rows", () => {
        const profile = buildPlayerProfile(sources)
        const ranked = composed.data.ranked

        expect(profile.id).toBe(composed.data.id)
        expect(profile.stats).toEqual(composed.data.stats)
        expect(profile.aliases).toEqual(composed.data.aliases)
        expect(profile.unarmed).toEqual(composed.data.unarmed)
        expect(profile.gadgets).toEqual(composed.data.gadgets)
        expect(profile.weapon_kos).toBe(composed.data.weapon_kos)
        expect(profile.thrown_kos).toBe(composed.data.thrown_kos)
        expect(profile.weapon_damage).toBe(composed.data.weapon_damage)

        expect(profile.ranked?.["1v1"]).toEqual(ranked?.["1v1"])
        expect(profile.ranked?.["3v3"]).toEqual(ranked?.["3v3"])
        expect(profile.ranked?.["2v2"]?.teams).toEqual([])
        expect(profile.ranked?.["2v2"]?.games).toBe(ranked?.["2v2"]?.games)

        const teams = ranked?.["2v2"]?.teams ?? []
        expect(profile.has_2v2).toBe(teams.some((team) => team.paired))
        expect(profile.solo_2v2).toEqual(
            teams.find((team) => !team.paired) ?? null,
        )
    })

    it("bubbles carry the metrics the charts read", () => {
        const profile = buildPlayerProfile(sources)
        const first = composed.data.legends.find(
            (legend) => legend.stats.games > 0,
        )

        expect(profile.legend_bubbles.length).toBeGreaterThan(0)
        expect(profile.legend_bubbles[0]).toEqual(
            first === undefined
                ? undefined
                : {
                      id: first.id,
                      name: first.name,
                      name_key: first.name_key,
                      slug: first.slug,
                      level: first.stats.level,
                      matchtime: first.stats.matchtime,
                      kos: first.stats.kos,
                      damage_dealt: first.stats.damage_dealt,
                      games: first.stats.games,
                      wins: first.stats.wins,
                  },
        )
    })
})
