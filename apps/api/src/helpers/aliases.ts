import { searchKey } from "@crh/core/services/archive"
import type { BHPlayerAlias } from "@crh/db/schema"

/**
 * Whether an upstream row is worth storing as an alias.
 *
 * The Brawlhalla payloads use `0` as a "no player" sentinel, and occasionally
 * ship a blank name (a 2v2 `teamname` can split into an empty half). Storing
 * either would put a row in the alias indexes that no search can ever
 * meaningfully return, so they are dropped before they reach the database.
 *
 * A present-but-blank name is rejected via `searchKey`, which trims — that
 * keeps "   " from being stored as a searchable alias.
 */
const isStorableAlias = (playerId: string | number, name: string): boolean =>
    String(playerId) !== "0" && searchKey(name).length > 0

/**
 * Builds alias rows from an upstream player payload.
 *
 * `aliasLower` has to be computed here rather than by SQL `lower()`, which
 * does not fold non-ASCII. `searchKey` is the same folding the search needle
 * goes through, so stored keys and lookup keys always agree.
 *
 * `createdAt` and `lastSeen` are both "now" on insert; the upsert deliberately
 * only refreshes `lastSeen`, so `createdAt` keeps meaning "first seen".
 *
 * Returns an array so a filtered-out player contributes zero rows without every
 * caller repeating the guard — the handlers only ever spread this into
 * `upsertPlayerAliases`.
 *
 * Exported for its test. It is the unit that took the clan endpoint down —
 * `GET /api/v1/stats/clan/9` then, `/api/v1/upstream/brawlhalla/clan/9` now —
 * and the guard below is the kind of thing that reads as obviously fine until
 * it is pointed at a payload where the field is simply absent.
 */
export const aliasRows = (player: {
    readonly id: string | number
    /**
     * Optional because every name reaching this function comes from unvalidated
     * upstream JSON: a guild member v1 could not name, or the absent half of a
     * 2v2 `teamname` with no `+`.
     */
    readonly name: string | undefined
}): BHPlayerAlias[] => {
    const { id, name } = player

    // The load-bearing check, and the one whose absence was a production 500.
    // `searchKey` calls `.trim()`, so a missing name threw a `TypeError` out of
    // the handler and took the whole endpoint down — which is exactly what
    // `GET /api/v1/stats/clan/9` did, because v1 intermittently omits the `name`
    // key on guild members. This is also the only place the value can be
    // narrowed, since a boolean guard cannot teach the compiler that a field is
    // present: upstream JSON makes "this is a string" an assumption at this
    // boundary, never a fact. A name we cannot use is a row we skip, not a
    // request we fail.
    if (typeof name !== "string") return []

    if (!isStorableAlias(id, name)) return []

    const seenAt = new Date()

    return [
        {
            playerId: id.toString(),
            alias: name,
            aliasLower: searchKey(name),
            createdAt: seenAt,
            lastSeen: seenAt,
            public: true,
        },
    ]
}
