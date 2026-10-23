import { Atom } from "effect/unstable/reactivity"

/** Queries shorter than this are not worth a request. */
export const MIN_SEARCH_LENGTH = 3

/**
 * What the search bar shows.
 *
 * A single shared atom so the hand-off carries the text with it: the landing
 * bar, the header pill and the rankings bar all read and write the same value,
 * which is why the first keystroke is never lost when the page changes.
 */
export const searchQueryAtom = Atom.make("")

/** Typing has to settle before the query is used. */
export const debouncedSearchQueryAtom = searchQueryAtom.pipe(
    Atom.debounce("300 millis"),
)

/**
 * The debounced query, but only once it is long enough to search.
 *
 * Empty means "no filter", so a one- or two-character query leaves the table
 * unfiltered instead of firing a prefix scan.
 */
export const activeSearchQueryAtom = Atom.make((get) => {
    const query = get(debouncedSearchQueryAtom).trim()

    return query.length >= MIN_SEARCH_LENGTH ? query : ""
})
