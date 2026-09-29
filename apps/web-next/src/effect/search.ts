import { Atom } from "effect/unstable/reactivity"
import { MIN_LOOKUP_LENGTH } from "@crh/api-contract/schemas"

/**
 * The lookup's query state, as atoms.
 *
 * The debounce is `Atom.debounce` rather than a timer in a component: the delay
 * is part of the *data* flowing to the request, not a rendering concern, and
 * keeping it here means the raw input and the settled query are two views of one
 * atom instead of a value plus a shadow copy maintained by an effect. The input
 * reads the raw atom, so typing is never delayed — only the request is.
 *
 * Module-level because there is exactly one lookup overlay; a per-component
 * instance would silently reset the query whenever the overlay remounted.
 */

/** What the user has typed. Updated on every keystroke. */
export const searchQueryAtom = Atom.make("")

/** The query, once typing has paused. This is what leaves the browser. */
export const settledQueryAtom = searchQueryAtom.pipe(
    Atom.debounce("180 millis"),
)

/**
 * The settled query, but only once it is worth sending.
 *
 * Empty means "do not search", which covers both an untouched overlay and a
 * query too short to match: the server refuses anything under the minimum, so
 * sending it would spend a request on a guaranteed empty answer. The minimum is
 * imported from the contract so the two sides cannot disagree about it.
 */
export const activeQueryAtom = Atom.make((get) => {
    const query = get(settledQueryAtom).trim()

    return query.length >= MIN_LOOKUP_LENGTH ? query : ""
})
