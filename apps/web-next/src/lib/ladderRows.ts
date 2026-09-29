import type {
    Rankings1v1Envelope,
    Rankings2v2Envelope,
    Rankings3v3Envelope,
} from "@crh/api-contract/schemas"

/**
 * The view shape of a ladder row.
 *
 * One shape for all three brackets rather than one per ladder, because the
 * *interaction* is identical — a row is a whole-row target that opens one
 * profile (1v1, 3v3) or two (2v2) — and the interaction is what this app is
 * studying.
 *
 * The API hands back a product row already: a slug per player and, for 2v2, the
 * pair as a tuple. This module only flattens `team`/single-player rows into the
 * one `members` list the table renders. It used to do more — split a joined
 * `teamname`, recover two names from it — and none of that belongs on the client
 * now that the server sends both members separately.
 */
export type LadderMember = {
    readonly id: number
    readonly name: string
    /** Canonical URL segment, so a link never re-derives one. */
    readonly slug: string
}

export type LadderRow = {
    readonly key: string
    readonly rank: number
    readonly rating: number
    readonly tier: string
    /** One member for 1v1 and 3v3; two for a 2v2 team. */
    readonly members: readonly LadderMember[]
}

export const to1v1Rows = (
    envelope: Rankings1v1Envelope,
): readonly LadderRow[] =>
    envelope.data.map((row) => ({
        key: row.slug,
        rank: row.rank,
        rating: row.rating,
        tier: row.tier ?? "Unranked",
        members: [{ id: row.id, name: row.name, slug: row.slug }],
    }))

/**
 * A 2v2 row is a pair, and both members are already separate references.
 *
 * The tuple always has two slots; a solo queue fills the second with a zero-id
 * sentinel, which the server marks with `paired: false`. Dropping those here is
 * the same filter the raw payload needed, but the signal is now explicit rather
 * than an id a reader has to know the meaning of.
 */
export const to2v2Rows = (
    envelope: Rankings2v2Envelope,
): readonly LadderRow[] =>
    envelope.data.map((row) => ({
        key: `${row.team[0].id}-${row.team[1].id}`,
        rank: row.rank,
        rating: row.rating,
        tier: row.tier ?? "Unranked",
        members: row.team.filter((member) => member.id > 0),
    }))

/**
 * A 3v3 row is a single player.
 *
 * 3v3 is a solo queue whose teams are assembled per match, so its ladder looks
 * like 1v1 rather than like a team table — the mode name is about the match, not
 * about the roster.
 */
export const to3v3Rows = (
    envelope: Rankings3v3Envelope,
): readonly LadderRow[] =>
    envelope.data.map((row) => ({
        key: row.slug,
        rank: row.rank,
        rating: row.rating,
        tier: row.tier ?? "Unranked",
        members: [{ id: row.id, name: row.name, slug: row.slug }],
    }))
