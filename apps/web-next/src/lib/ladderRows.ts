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

export const to1v1Rows = (
    rows: readonly Ranking1v1[],
): readonly LadderRow[] =>
    rows.map((row) => ({
        key: String(row.brawlhalla_id),
        rank: row.rank,
        rating: row.rating,
        tier: row.tier,
        members: [{ id: row.brawlhalla_id, name: row.name }],
    }))

/**
 * A 2v2 row carries one `teamname` string rather than the two players.
 *
 * Splitting on `"+"` is the same convention the API's own mapping uses to build
 * that string, so the round trip is exact and the ids still come from the
 * payload rather than being parsed out of a name.
 */
export const to2v2Rows = (
    rows: readonly Ranking2v2[],
): readonly LadderRow[] =>
    rows.map((row) => {
        const [first = "", second = ""] = row.teamname.split("+")

        return {
            key: `${row.brawlhalla_id_one}-${row.brawlhalla_id_two}`,
            rank: row.rank,
            rating: row.rating,
            tier: row.tier,
            members: [
                { id: row.brawlhalla_id_one, name: first },
                { id: row.brawlhalla_id_two, name: second },
            ].filter((member) => member.id > 0),
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
