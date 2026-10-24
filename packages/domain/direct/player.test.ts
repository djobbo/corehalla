import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { playerRankedMock } from "@crh/bhapi/mocks/playerRanked"
import { playerStatsMock } from "@crh/bhapi/mocks/playerStats"
import { V1Unavailable } from "../upstream/v1"
import {
    PlayerNotFound,
    directPlayerClan,
    directPlayerLegends,
    directPlayerProfile,
    directPlayerTeams,
    directPlayerWeapons,
} from "./player"
import type { V1UpstreamShape } from "../upstream/client"

const upstream = (
    overrides: Partial<V1UpstreamShape> = {},
): V1UpstreamShape => ({
    getRankings: () => Effect.succeed([]),
    getPlayerStats: () => Effect.succeed(playerStatsMock),
    getPlayerClan: () => Effect.succeed(null),
    getPlayerRanked1v1: () => Effect.succeed(playerRankedMock),
    getPlayerTeams: () => Effect.succeed(playerRankedMock["2v2"]),
    getPlayerRanked: () => Effect.succeed(playerRankedMock),
    getPlayer3v3Ranked: () => Effect.succeed(null),
    getClan: () => Effect.succeed(null),
    ...overrides,
})

const unavailable = () =>
    new V1Unavailable({ operation: "stats", reason: "status", status: 500 })

describe("direct section fallbacks", () => {
    it("rebuilds a complete profile from v1", async () => {
        const result = await Effect.runPromise(
            directPlayerProfile(upstream(), 1),
        )

        expect(result.meta.complete).toBe(true)
        expect(result.data.id).toBe(playerStatsMock.brawlhalla_id)
        expect(result.data.has_2v2).toBe(true)
        expect(result.data.aliases).toEqual([])
        expect(result.data.legend_bubbles.length).toBeGreaterThan(0)
    })

    it("still returns the profile when an optional source fails", async () => {
        const result = await Effect.runPromise(
            directPlayerProfile(
                upstream({
                    getPlayerRanked1v1: () => Effect.fail(unavailable()),
                }),
                1,
            ),
        )

        expect(result.meta.complete).toBe(false)
        expect(result.meta.parts.ranked1v1).toBe("status")
        expect(result.data.ranked?.["1v1"]).toBeNull()
    })

    it("fails the section when the required source fails", async () => {
        const result = await Effect.runPromise(
            directPlayerProfile(
                upstream({
                    getPlayerStats: () => Effect.fail(unavailable()),
                }),
                1,
            ).pipe(Effect.result),
        )

        expect(result._tag).toBe("Failure")

        if (result._tag === "Failure") {
            expect(result.failure._tag).toBe("SectionFailed")
        }
    })

    it("surfaces a definitive miss as PlayerNotFound", async () => {
        const result = await Effect.runPromise(
            directPlayerProfile(
                upstream({ getPlayerStats: () => Effect.succeed(null) }),
                1,
            ).pipe(Effect.result),
        )

        expect(result._tag).toBe("Failure")

        if (result._tag === "Failure") {
            expect(result.failure).toBeInstanceOf(PlayerNotFound)
        }
    })

    it("builds the lazy legends and weapons sections", async () => {
        const legends = await Effect.runPromise(
            directPlayerLegends(upstream(), 1),
        )
        const weapons = await Effect.runPromise(
            directPlayerWeapons(upstream(), 1),
        )

        expect(legends.data.length).toBeGreaterThan(0)
        expect(weapons.data.length).toBeGreaterThan(0)
    })

    it("returns an empty 2v2 record when the player has no teams", async () => {
        const result = await Effect.runPromise(
            directPlayerTeams(
                upstream({ getPlayerTeams: () => Effect.succeed([]) }),
                1,
            ),
        )

        expect(result.data.teams).toEqual([])
        expect(result.data.games).toBe(0)
    })

    it("returns a null clan section when the player is clanless", async () => {
        const result = await Effect.runPromise(directPlayerClan(upstream(), 1))

        expect(result.data).toBeNull()
        expect(result.meta.complete).toBe(true)
    })
})
