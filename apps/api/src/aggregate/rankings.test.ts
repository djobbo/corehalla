import { describe, expect, it } from "@effect/vitest"
import { rankings1v1Mock } from "@crh/bhapi/mocks/rankings1v1"
import { rankings2v2Mock } from "@crh/bhapi/mocks/rankings2v2"
import {
    bestLegendIndex,
    buildRankings1v1,
    buildRankings2v2,
} from "./rankings"
import type { BestLegendRow } from "@crh/core/services/archive"

/**
 * The live ladders' product shape.
 *
 * The reshuffle is small enough to read as "no logic", which is exactly why it
 * is worth pinning: the two things a reader would notice if they broke are that
 * a row links to the right player, and that a 2v2 row's two members are the two
 * on the wire rather than a joined string taken apart.
 */
describe("ladder aggregation", () => {
    it("falls back to v1's own best legend when the archive has none", () => {
        const envelope = buildRankings1v1(
            rankings1v1Mock,
            new Map(),
            1_700_000_000_000,
        )
        const row = envelope.data[0]

        // The mock's first row carries legend id 50 (Petra) from the payload.
        expect(row.best_legend?.id).toBe(50)
        expect(row.best_legend?.games).toBe(76)
    })

    it("prefers the archive's best legend when we have crawled the player", () => {
        const archive: BestLegendRow[] = [
            { playerId: "5156845", legendId: 3, games: 500, wins: 400 },
            { playerId: "5156845", legendId: 7, games: 120, wins: 60 },
        ]

        const row = buildRankings1v1(
            rankings1v1Mock,
            bestLegendIndex(archive),
            1_700_000_000_000,
        ).data[0]

        // Max games wins: 500 over 120.
        expect(row.best_legend?.id).toBe(3)
        expect(row.best_legend?.games).toBe(500)
        expect(row.best_legend?.wins).toBe(400)
    })

    it("gives every row a canonical slug", () => {
        const row = buildRankings1v1(
            rankings1v1Mock,
            new Map(),
            1_700_000_000_000,
        ).data[0]

        expect(row.slug.startsWith(`${row.id}-`)).toBe(true)
    })

    it("keeps both members of a 2v2 team as separate references", () => {
        const row = buildRankings2v2(rankings2v2Mock, 1_700_000_000_000).data[0]

        expect(row.team[0].id).toBe(3138661)
        expect(row.team[0].name).toBe("GP | Pier")
        expect(row.team[1].id).toBe(74980283)
        expect(row.team[1].name).toBe("Teke?")
        expect(row.team.every((member) => member.slug.length > 0)).toBe(true)
    })
})
