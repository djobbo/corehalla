import { describe, expect, it } from "vitest"
import {
    excludedSet,
    hasStorableName,
    playerDataOmitColumns,
    RANKED_PLAYER_COLUMNS,
    snapshotFromRanked,
    STATS_PLAYER_COLUMNS,
    toPlayerDataRow,
    toPlayerRankedRow,
} from "./player-writes"
import { playerRankedMock } from "@crh/bhapi/mocks/playerRanked"
import { playerStatsMock } from "@crh/bhapi/mocks/playerStats"
import type { BHPlayerData } from "@crh/db/schema"
import type { PlayerRanked } from "@crh/bhapi/types"
import type { RankedSnapshot } from "./player-writes"

const snapshot: RankedSnapshot = {
    rating: 2083,
    peak: 2200,
    games: 29,
    wins: 28,
    tier: "Diamond",
    region: "eu",
}

const noRankedRecord = {
    ...playerRankedMock,
    name: "",
    rating: 0,
    peak_rating: 0,
    tier: "none",
    region: "none",
    games: 0,
    wins: 0,
} as unknown as PlayerRanked

type Source = "stats" | "ranked" | "both"

const rowFor = (source: Source): BHPlayerData => {
    if (source === "ranked") {
        return toPlayerRankedRow({ id: "1", name: "player" }, snapshot)
    }

    return toPlayerDataRow(playerStatsMock, source === "both" ? snapshot : null)
}

const writableColumns = (source: Source, name = true): readonly string[] =>
    Object.keys(
        excludedSet(
            rowFor(source),
            playerDataOmitColumns({
                stats: source !== "ranked",
                ranked: source !== "stats",
                name,
            }),
        ),
    )

describe("snapshotFromRanked", () => {
    it("carries the standing and lowercases the region", () => {
        const snapshot = snapshotFromRanked(playerRankedMock)

        expect(snapshot?.rating).toBe(2402)
        expect(snapshot?.peak).toBe(2402)
        expect(snapshot?.tier).toBe("Diamond")
        expect(snapshot?.region).toBe("us-e")
    })

    it("names the tier v0 reports as null", () => {
        const snapshot = snapshotFromRanked({
            ...playerRankedMock,
            tier: null,
        })

        expect(snapshot?.tier).toBe("Valhallan")
    })

    it("yields null for a player with no 1v1 record", () => {
        expect(snapshotFromRanked(null)).toBeNull()
    })

    it("yields null for v0's zeroed placeholder, not just for a JSON null", () => {
        expect(snapshotFromRanked(noRankedRecord)).toBeNull()
    })

    it("treats either sentinel as no record", () => {
        // Whichever field v0 blanks first, the payload is still a placeholder.
        expect(
            snapshotFromRanked({
                ...noRankedRecord,
                region: "us-e",
            } as PlayerRanked),
        ).toBeNull()

        expect(
            snapshotFromRanked({
                ...noRankedRecord,
                rating: 1500,
            } as PlayerRanked),
        ).toBeNull()
    })
})

describe("toPlayerDataRow", () => {
    it("carries the ranked record when the caller has one", () => {
        const row = toPlayerDataRow(playerStatsMock, snapshot)

        expect(row.rating).toBe(2083)
        expect(row.peakRating).toBe(2200)
        expect(row.rankedGames).toBe(29)
        expect(row.rankedWins).toBe(28)
        expect(row.tier).toBe("Diamond")
        expect(row.region).toBe("eu")
    })

    it("fills the ranked columns with placeholders when the caller has none", () => {
        const row = toPlayerDataRow(playerStatsMock, null)

        expect(row.rating).toBe(0)
        expect(row.peakRating).toBe(0)
        expect(row.rankedGames).toBe(0)
        expect(row.rankedWins).toBe(0)
        expect(row.tier).toBe("")
        expect(row.region).toBe("")
    })

    it("writes identical stats columns either way", () => {
        const withRanked = toPlayerDataRow(playerStatsMock, snapshot)
        const without = toPlayerDataRow(playerStatsMock, null)

        expect(without.xp).toBe(withRanked.xp)
        expect(without.level).toBe(withRanked.level)
        expect(without.games).toBe(withRanked.games)
        expect(without.wins).toBe(withRanked.wins)
        expect(without.kos).toBe(withRanked.kos)
        expect(without.falls).toBe(withRanked.falls)
        expect(without.matchTime).toBe(withRanked.matchTime)
        expect(without.damageDealt).toBe(withRanked.damageDealt)
        expect(without.koUnarmed).toBe(withRanked.koUnarmed)
        expect(without.name).toBe(withRanked.name)
    })
})

describe("toPlayerRankedRow", () => {
    it("carries the standing", () => {
        const row = toPlayerRankedRow({ id: "1", name: "player" }, snapshot)

        expect(row.id).toBe("1")
        expect(row.name).toBe("player")
        expect(row.rating).toBe(2083)
        expect(row.peakRating).toBe(2200)
        expect(row.tier).toBe("Diamond")
        expect(row.region).toBe("eu")
    })

    it("zeroes the career stats", () => {
        const row = toPlayerRankedRow({ id: "1", name: "player" }, snapshot)

        expect(row.xp).toBe(0)
        expect(row.level).toBe(0)
        expect(row.games).toBe(0)
        expect(row.kos).toBe(0)
        expect(row.matchTime).toBe(0)
    })
})

describe("hasStorableName", () => {
    it("accepts a real name", () => {
        expect(hasStorableName("music is math")).toBe(true)
    })

    it("rejects the shapes upstream ships when it cannot name a player", () => {
        // v0 blanks it; v1 omits the key and the cast would read `undefined`.
        expect(hasStorableName("")).toBe(false)
        expect(hasStorableName("   ")).toBe(false)
        expect(hasStorableName(undefined)).toBe(false)
    })
})

describe("a write whose payload carried no name", () => {
    it("leaves the stored name alone from either half", () => {
        expect(writableColumns("stats", false)).not.toContain("name")
        expect(writableColumns("ranked", false)).not.toContain("name")
    })

    it("still updates everything else that half owns", () => {
        expect(writableColumns("stats", false)).toContain("lastUpdated")
        expect(writableColumns("ranked", false)).toContain("lastUpdated")
        expect(writableColumns("ranked", false)).toContain("rating")
    })
})

describe("a write with no ranked record", () => {
    it("keeps every ranked column out of SET", () => {
        const columns = writableColumns("stats")

        for (const column of RANKED_PLAYER_COLUMNS) {
            expect(columns).not.toContain(column)
        }
    })

    it("still updates the stats it does have", () => {
        const columns = writableColumns("stats")

        expect(columns).toContain("xp")
        expect(columns).toContain("level")
        expect(columns).toContain("kos")
        expect(columns).toContain("matchTime")
        expect(columns).toContain("lastUpdated")
    })

    it("never rewrites the primary key", () => {
        expect(writableColumns("stats")).not.toContain("id")
    })
})

describe("a write with a ranked record", () => {
    it("sets the ranked columns", () => {
        const columns = writableColumns("both")

        for (const column of RANKED_PLAYER_COLUMNS) {
            expect(columns).toContain(column)
        }
    })

    it("still never rewrites the primary key", () => {
        expect(writableColumns("both")).not.toContain("id")
    })
})

describe("a ranked-only write", () => {
    it("keeps every career-stat column out of SET", () => {
        const columns = writableColumns("ranked")

        for (const column of STATS_PLAYER_COLUMNS) {
            expect(columns).not.toContain(column)
        }
    })

    it("does update the standing and the name", () => {
        const columns = writableColumns("ranked")

        for (const column of RANKED_PLAYER_COLUMNS) {
            expect(columns).toContain(column)
        }

        expect(columns).toContain("name")
        expect(columns).toContain("lastUpdated")
    })

    it("never rewrites the primary key", () => {
        expect(writableColumns("ranked")).not.toContain("id")
    })
})
