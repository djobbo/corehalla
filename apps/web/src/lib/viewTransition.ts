type ViewTransitionDocument = Document & {
    startViewTransition?: (callback: () => void | Promise<void>) => {
        finished: Promise<void>
    }
}

/**
 * Runs a DOM update inside a view transition when the browser supports it.
 *
 * Used for the search hand-off, where the bar appears to travel from the hero
 * (or the header) to the top of the results page. Falls back to a plain update
 * when the API is missing or the user asked for reduced motion.
 */
export const withViewTransition = (
    update: () => void | Promise<void>,
): void => {
    if (typeof document === "undefined" || typeof window === "undefined") {
        void update()
        return
    }

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches
    const start = (document as ViewTransitionDocument).startViewTransition

    if (prefersReducedMotion || !start) {
        void update()
        return
    }

    start.call(document, update)
}
