import type { Ranking1v1, Ranking2v2, Ranking3v3 } from "@crh/bhapi/types"

/**
 * The view shape of a ladder row.
 *
 * One shape for both ladders rather than two branches in the table, because the
 * *interaction* is identical — a row is a whole-row target that opens one
 * profile (1v1) or two (2v2) — and the interaction is what this app is studying.
 */
export type LadderRow = {
    readonly key: string
    readonly rank: number
    readonly rating: number
    readonly tier: string
    /** One member for 1v1; two for a 2v2 team. */
    readonly members: readonly { readonly id: number; readonly name: string }[]
}

export const to1v1Rows = (rows: readonly Ranking1v1[]): readonly LadderRow[] =>
    rows.map((row) => ({
        key: String(row.brawlhalla_id),
        rank: row.rank,
        rating: row.rating,
        tier: row.tier,
        members: [{ id: row.brawlhalla_id, name: row.name }],
    }))

/**
 * A 2v2 row names both players separately, and those are what this reads.
 *
 * It used to split `teamname` on `"+"`, which is the same defect the legacy API
 * has: a username containing a `+` produces the wrong two names, and nothing
 * downstream can tell. The joined string is display-only.
 */
export const to2v2Rows = (rows: readonly Ranking2v2[]): readonly LadderRow[] =>
    rows.map((row) => {
        return {
            key: `${row.brawlhalla_id_one}-${row.brawlhalla_id_two}`,
            rank: row.rank,
            rating: row.rating,
            tier: row.tier,
            members: [
                { id: row.brawlhalla_id_one, name: row.name_one },
                { id: row.brawlhalla_id_two, name: row.name_two },
            ].filter((member) => member.id > 0 && member.name !== ""),
        }
    })

/**
 * A 3v3 row is a single player.
 *
 * 3v3 is a solo queue whose teams are assembled per match, so its ladder looks
 * like 1v1 rather than like a team table — the mode name is about the match, not
 * about the roster.
 */
export const to3v3Rows = (rows: readonly Ranking3v3[]): readonly LadderRow[] =>
    rows.map((row) => ({
        key: String(row.brawlhalla_id),
        rank: row.rank,
        rating: row.rating,
        tier: row.tier,
        members: [{ id: row.brawlhalla_id, name: row.name }],
    }))
