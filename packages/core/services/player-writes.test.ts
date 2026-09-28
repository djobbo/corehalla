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

/**
 * Where the player tables get written from, and by whom.
 *
 * Three callers write `BHPlayerData` and none of them has the whole row. The
 * crawler holds both halves and owns the row outright; a profile view splits it
 * between two endpoints, one holding the career stats and one holding the
 * standing. All three must store the same stats columns, and none may overwrite
 * a column it was not given — otherwise every visit to a player's page would
 * reset the tier and rating the crawler had recorded, or the stats the other
 * half of the same page view had just written.
 *
 * That is a property of the generated `SET` clause rather than of the values,
 * so the cases below run `playerDataOmitColumns` — the function the archive
 * itself passes to `excludedSet` — and inspect which columns survive it.
 * Restating the omit list in the test would have checked the test, not the
 * write: an earlier version of this file passed with the fix reverted for
 * exactly that reason.
 */

const snapshot: RankedSnapshot = {
    rating: 2083,
    peak: 2200,
    games: 29,
    wins: 28,
    tier: "Diamond",
    region: "eu",
}

/**
 * The payload v0 really answers for a player who has never placed.
 *
 * Captured from a live response: 200, not a 404, with the name blanked and
 * `tier`/`region` set to the literal `"none"`. It is the whole reason a profile
 * view used to erase a name — see `snapshotFromRanked`.
 */
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

/** Which halves of the row a given caller holds. */
type Source = "stats" | "ranked" | "both"

const rowFor = (source: Source): BHPlayerData => {
    if (source === "ranked") {
        return toPlayerRankedRow({ id: "1", name: "player" }, snapshot)
    }

    return toPlayerDataRow(playerStatsMock, source === "both" ? snapshot : null)
}

/** The columns an upsert from that caller is permitted to overwrite. */
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
        // The mock answers `US-E`; our stored vocabulary is lowercase, and the
        // region chips and flags are built from that form.
        expect(snapshot?.region).toBe("us-e")
    })

    /*
     * v0 has no "Valhallan": it reports the tier above Diamond as `null`. The
     * mapper used to cast that straight through, which wrote null into a
     * `NOT NULL` column — failing the insert for exactly the players most
     * likely to be on a leaderboard, and doing it silently from the caller's
     * side because the cast made the type look satisfied.
     */
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

    /*
     * The bug this pins, reproduced from the cache: v0 answers 200 with a
     * zeroed placeholder for an unranked player rather than `null`. Treating
     * it as a standing wrote `tier = "none"` and a blank name over the row the
     * stats half had just stored — the archive's career board then showed the
     * player with no name at all.
     */
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

    /*
     * The placeholders exist only so the INSERT has values for columns the
     * schema declares NOT NULL. They are not a claim that the player is
     * unranked, which is why the `SET` clause below has to leave them out.
     */
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
        // The ranked half is the only thing the snapshot changes. A profile
        // view must store exactly the career totals the crawler would, or the
        // two writers would take turns undoing each other.
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
    /*
     * The other half of the blank-name bug. The two writers run in the same
     * request and each used to set `name` unconditionally, so whichever landed
     * second decided the row — and a payload without a name erased the one the
     * other half had just stored.
     */
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

        // The regression this pins: with all six columns in `SET`, a profile
        // view overwrote the crawler's tier, rating and region with the
        // placeholders above on every visit.
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

        // The mirror of the stats-only case, and the reason both lists exist:
        // this caller has the standing and none of the totals, so letting it
        // write them would zero a player's stats whenever the ranked request
        // happened to land second.
        for (const column of STATS_PLAYER_COLUMNS) {
            expect(columns).not.toContain(column)
        }
    })

    it("does update the standing and the name", () => {
        const columns = writableColumns("ranked")

        for (const column of RANKED_PLAYER_COLUMNS) {
            expect(columns).toContain(column)
        }

        // Either path may record a rename — when the payload it was handed
        // actually carries the new name (see the blank-name case below).
        expect(columns).toContain("name")
        expect(columns).toContain("lastUpdated")
    })

    it("never rewrites the primary key", () => {
        expect(writableColumns("ranked")).not.toContain("id")
    })
})
