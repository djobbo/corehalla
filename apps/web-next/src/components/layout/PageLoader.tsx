import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import { useRouter } from "@tanstack/react-router"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AnimatedLogo } from "./AnimatedLogo"

/**
 * The page loader: the mark, alone on a scrim, while a client-side navigation
 * waits on its data.
 *
 * ## Why this is not the boundary's fallback
 *
 * The loading UI is split in two. Inside the boundary (and inside the router's
 * pending slot) sits a *probe* — a component that renders nothing and whose only
 * job is to mount when a wait starts and unmount when it ends. The overlay that
 * actually draws is mounted beside the boundary and therefore outlives it.
 *
 * That split is the whole design, because a `Suspense` fallback is torn down in
 * the same commit that reveals the page it was waiting for: an exit animation
 * written inside one never gets to play, and the reveal has to be instantaneous.
 * Here the probe reports, the overlay animates, and the two are never mounted
 * by the same commit.
 *
 * ## What drives it
 *
 * Both of the places a wait can be visible:
 *
 * - The router's `pendingComponent`, which is what a *navigation* waits behind
 *   (see `router.tsx` — route loaders await their atoms, so the router knows).
 * - The outlet's `Suspense` fallback, for a component that suspends on
 *   something no loader preloaded. That path shows the mark immediately, which
 *   is right: the content it would have drawn is not there to keep.
 *
 * The counter is what lets the two overlap, and lets a route whose data arrives
 * in stages suspend more than once without restarting the animation.
 *
 * ## Why refs
 *
 * The probe can mount, unmount and mount again across commits, and the timers
 * have to survive those renders. Keeping the clock in refs and only the *phase*
 * in state means the state machine cannot be clobbered by a stale closure, and
 * the overlay re-renders once per real transition rather than once per timer.
 */

/**
 * The shortest time the mark stays up once it has appeared, so a fast response
 * still reads as a transition rather than a flicker. Slightly under the router's
 * `defaultPendingMinMs`, so on a navigation the router's minimum is what
 * applies and this only ever covers a component-level suspension.
 */
const MIN_VISIBLE_MS = 420

/**
 * How long the overlay stays mounted after the page is ready, so the exit
 * animation can finish. Must be at least the longest exit transition in
 * `app.css` (520ms of transform, 340ms of opacity behind a 140ms delay).
 */
const EXIT_MS = 560

type Phase = "idle" | "loading" | "exiting"

type PageLoaderState = {
    readonly phase: Phase
    /** A wait started: called as a probe mounts. */
    readonly begin: () => void
    /** A wait ended: called as a probe unmounts. */
    readonly end: () => void
}

const PageLoaderContext = createContext<PageLoaderState | null>(null)

type Timers = {
    hide?: number
    reset?: number
}

const clearTimer = (timers: Timers, key: keyof Timers) => {
    const handle = timers[key]

    if (handle !== undefined) {
        window.clearTimeout(handle)
        delete timers[key]
    }
}

export const PageLoaderProvider = ({ children }: { children: ReactNode }) => {
    const [phase, setPhase] = useState<Phase>("idle")

    const phaseRef = useRef<Phase>("idle")
    /** How many probes are waiting. Staggered loads overlap; the last one ends it. */
    const waiting = useRef(0)
    const shownAt = useRef(0)
    const timers = useRef<Timers>({})

    const commit = useCallback((next: Phase) => {
        phaseRef.current = next
        setPhase(next)
    }, [])

    const begin = useCallback(() => {
        waiting.current += 1

        // An exit already in flight is cancelled rather than queued: the overlay
        // is still on screen, so the mark snaps back to its working size instead
        // of leaving and re-entering.
        clearTimer(timers.current, "hide")
        clearTimer(timers.current, "reset")

        if (phaseRef.current === "loading") return

        shownAt.current = performance.now()
        commit("loading")
    }, [commit])

    const end = useCallback(() => {
        waiting.current = Math.max(0, waiting.current - 1)

        if (waiting.current > 0) return
        if (phaseRef.current !== "loading") return

        const elapsed = performance.now() - shownAt.current
        const hold = Math.max(0, MIN_VISIBLE_MS - elapsed)

        timers.current.hide = window.setTimeout(() => {
            delete timers.current.hide

            // A new wait took over while this one was waiting out its minimum:
            // leave the mark where it is and let that wait end the sequence.
            if (waiting.current > 0) return

            commit("exiting")

            timers.current.reset = window.setTimeout(() => {
                delete timers.current.reset

                if (waiting.current > 0) return

                commit("idle")
            }, EXIT_MS)
        }, hold)
    }, [commit])

    // A provider unmounted mid-transition — a hard reload, or the router
    // remounting the root — must not leave timers behind.
    useEffect(() => {
        const pending = timers.current

        return () => {
            clearTimer(pending, "hide")
            clearTimer(pending, "reset")
        }
    }, [])

    const value = useMemo<PageLoaderState>(
        () => ({ phase, begin, end }),
        [phase, begin, end],
    )

    return (
        <PageLoaderContext.Provider value={value}>
            {children}
        </PageLoaderContext.Provider>
    )
}

/**
 * The in-boundary half, and the router's pending slot.
 *
 * It renders nothing, and that is the point: it is a mount signal, not a loading
 * surface. The overlay beside the boundary does the drawing, and the outlet is
 * free to collapse to zero height for the length of the wait — which the fixed
 * overlay covers anyway.
 *
 * Having no provider above it is a state it has to tolerate rather than a bug.
 * The server renders the document shell with every match still pending, so this
 * runs before `RootComponent` — and therefore before the provider — exists; and
 * the same is true of a pending *root* match, which the router renders outside
 * the root component. Rendering nothing there is correct: there is no browser,
 * no transition, and nothing to animate.
 */
export const PageLoaderProbe = () => {
    const loader = useContext(PageLoaderContext)

    useEffect(() => {
        if (loader === null) return

        loader.begin()

        return loader.end
    }, [loader])

    return null
}

/**
 * The overlay.
 *
 * Unmounted while idle, so an app that is not navigating has no fixed
 * full-viewport element in the tree at all — and so that `PageLoaderOverlay`
 * below mounts afresh on each appearance, which is what makes its enter step
 * run once per appearance rather than once per app.
 */
export const PageLoader = () => {
    const loader = useContext(PageLoaderContext)

    if (loader === null || loader.phase === "idle") return null

    return <PageLoaderOverlay phase={loader.phase} />
}

type PageLoaderOverlayProps = {
    readonly phase: Exclude<Phase, "idle">
}

const PageLoaderOverlay = ({ phase }: PageLoaderOverlayProps) => {
    const router = useRouter()

    /*
     * The overlay is *inserted* in its loading state, so a transition written
     * straight onto that state has no earlier value to move from and the mark
     * simply appears at full size. `entered` is the missing earlier value: the
     * overlay renders at its starting size, the browser is made to lay that out,
     * and only then is it flipped to the settled state the transition runs to.
     *
     * The layout read is what makes one frame enough. Without it, the flip can
     * land in the same style recalculation as the insert, and the browser sees
     * one change rather than two.
     */
    const [entered, setEntered] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        void ref.current?.getBoundingClientRect()

        const frame = requestAnimationFrame(() => setEntered(true))

        return () => cancelAnimationFrame(frame)
    }, [])

    /*
     * A synchronous read of the history index, so it is safe in render and
     * cannot change while the overlay is up. Without somewhere to go back to
     * there is nothing to cancel *to* — the wait is the only thing this route
     * has — so the button is not offered rather than offered and inert.
     */
    const canCancel = router.history.canGoBack()

    const cancel = useCallback(() => {
        /*
         * Cancelling is going back, not aborting the request. The router has
         * already committed the destination's URL by the time a loader is
         * showing, so the only way out of the wait is the way in. The discarded
         * load is not wasted either: whatever it fetches lands in the atom
         * registry, so a later visit to that route starts warm.
         */
        router.history.back()
    }, [router])

    return (
        <div
            ref={ref}
            className="ch-pageloader"
            data-phase={phase}
            data-entered={entered ? "" : undefined}
        >
            {/*
             * The status region holds the mark and the bar and nothing else.
             * It is `<output>` rather than `<div role="status">` for the same
             * reason `Spinner` is: `output` already *is* a status live region,
             * so the semantics come from the element instead of from an ARIA
             * attribute asserting them. The label is what a screen reader
             * announces — the mark is decorative and the bar is a picture of a
             * wait, not a value anyone can read.
             */}
            <output className="ch-pageloader-splash" aria-label="Loading">
                <AnimatedLogo className="ch-pageloader-mark" />
                <div className="ch-progress ch-pageloader-bar" aria-hidden>
                    <span />
                </div>
            </output>

            {canCancel && (
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="ch-pageloader-cancel"
                    onClick={cancel}
                >
                    Cancel
                </Button>
            )}
        </div>
    )
}
