import { searchKey } from "@crh/core/services/archive"
import type { BHPlayerAlias } from "@crh/db/schema"

// Drop the `0` "no player" sentinel and blank names before they reach the indexes.
const isStorableAlias = (playerId: string | number, name: string): boolean =>
    String(playerId) !== "0" && searchKey(name).length > 0

/**
 * `aliasLower` is folded here: SQL `lower()` does not fold non-ASCII, and
 * `searchKey` must match the needle. Upsert refreshes only `lastSeen`.
 */
export const aliasRows = (player: {
    readonly id: string | number
    // Optional: unvalidated upstream JSON can omit `name` (e.g. guild members).
    readonly name: string | undefined
}): BHPlayerAlias[] => {
    const { id, name } = player

    // Narrow here; a missing name is a skipped row, not a failed request.
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
