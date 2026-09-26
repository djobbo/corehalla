import { Atom } from "effect/unstable/reactivity"

/**
 * What the pointer is currently over, and what that resolves to after a pause.
 *
 * Hover-intent as two atoms rather than a timer in a component, for the same
 * reason the search debounce is: the delay belongs to the *value*, and deriving
 * both the intent and the grace period from one mechanism means they cannot
 * disagree.
 *
 * The mechanics are worth spelling out because they give two behaviours for one
 * setting:
 *
 * - Entering a link sets a target, and nothing appears until the pointer has
 *   stayed for the debounce. Sweeping across a leaderboard therefore fires
 *   nothing.
 * - Leaving sets `null`, and the *same* debounce keeps the last target alive for
 *   that long — which is exactly the grace period needed to move the pointer from
 *   a link into the card without it vanishing on the way.
 *
 * Moving between two links resets the pending value, so a sweep produces one
 * preview at the end rather than one per row.
 */

export type PreviewTarget = {
    readonly type: "player" | "clan"
    readonly id: string
    /** Viewport coordinates of the link, captured when the pointer entered. */
    readonly top: number
    readonly left: number
    readonly width: number
    readonly height: number
}

/** Set on pointer enter, cleared on leave. */
export const hoveredAtom = Atom.make<PreviewTarget | null>(null)

/** The hovered target, once the pointer has settled on it. */
export const previewAtom = hoveredAtom.pipe(Atom.debounce("120 millis"))
