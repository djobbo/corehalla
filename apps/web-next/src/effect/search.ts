import { Atom } from "effect/unstable/reactivity"
import type { RankedRegion } from "@crh/api-contract/schemas"
import { MIN_LOOKUP_LENGTH } from "@crh/api-contract/schemas"

type Region = typeof RankedRegion.Type

// Module-level: one overlay; a per-mount atom would reset on remount.
export const searchQueryAtom = Atom.make("")

/** Leaderboard search is region-scoped; Global covers every region. */
export const searchRegionAtom = Atom.make<Region>("all")

export const settledQueryAtom = searchQueryAtom.pipe(
    Atom.debounce("180 millis"),
)

/** Empty when under the contract minimum so we never spend a guaranteed-empty request. */
export const activeQueryAtom = Atom.make((get) => {
    const query = get(settledQueryAtom).trim()

    return query.length >= MIN_LOOKUP_LENGTH ? query : ""
})
