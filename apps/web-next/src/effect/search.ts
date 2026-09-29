import { Atom } from "effect/unstable/reactivity"
import { MIN_LOOKUP_LENGTH } from "@crh/api-contract/schemas"

// Module-level: one overlay; a per-mount atom would reset on remount.
export const searchQueryAtom = Atom.make("")

export const settledQueryAtom = searchQueryAtom.pipe(
    Atom.debounce("180 millis"),
)

/** Empty when under the contract minimum so we never spend a guaranteed-empty request. */
export const activeQueryAtom = Atom.make((get) => {
    const query = get(settledQueryAtom).trim()

    return query.length >= MIN_LOOKUP_LENGTH ? query : ""
})
