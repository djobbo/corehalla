import { useRouterState } from "@tanstack/react-router"
import { useCallback, useEffect, useRef, useState } from "react"

/** Wait before showing, so a navigation that resolves quickly never flashes. */
const SHOW_DELAY_MS = 150

/** Shortest visible time, so a fast navigation still reads as progress. */
const MIN_VISIBLE_MS = 400

const FADE_MS = 180

type Phase = "idle" | "active" | "done"

type Timers = {
    show?: number
    hold?: number
    hide?: number
}

const clearTimer = (timers: Timers, key: keyof Timers) => {
    const handle = timers[key]

    if (handle !== undefined) {
        window.clearTimeout(handle)
        delete timers[key]
    }
}

/**
 * The in-flight indicator for ordinary navigations. It sits over the masthead
 * and reports progress without covering the page, so the previous route stays
 * readable while the next one loads; the full-screen poster is reserved for
 * loads slow enough to need it.
 */
export const NavigationProgress = () => {
    const isLoading = useRouterState({ select: (state) => state.isLoading })

    const [phase, setPhase] = useState<Phase>("idle")

    // Applied a frame after mount so the trickle transitions from zero.
    const [entered, setEntered] = useState(false)

    const phaseRef = useRef<Phase>("idle")
    const shownAt = useRef(0)
    const timers = useRef<Timers>({})

    const commit = useCallback((next: Phase) => {
        phaseRef.current = next
        setPhase(next)
    }, [])

    useEffect(() => {
        const pending = timers.current

        if (isLoading) {
            clearTimer(pending, "hold")
            clearTimer(pending, "hide")

            if (phaseRef.current === "active") return

            clearTimer(pending, "show")
            timers.current.show = window.setTimeout(() => {
                delete pending.show

                shownAt.current = performance.now()
                commit("active")
            }, SHOW_DELAY_MS)
            return
        }

        clearTimer(pending, "show")

        if (phaseRef.current !== "active") return

        const elapsed = performance.now() - shownAt.current

        timers.current.hold = window.setTimeout(
            () => {
                delete pending.hold

                setEntered(false)
                commit("done")

                timers.current.hide = window.setTimeout(() => {
                    delete pending.hide

                    commit("idle")
                }, FADE_MS)
            },
            Math.max(0, MIN_VISIBLE_MS - elapsed),
        )
    }, [isLoading, commit])

    useEffect(() => {
        if (phase !== "active") return

        const frame = requestAnimationFrame(() => setEntered(true))

        return () => cancelAnimationFrame(frame)
    }, [phase])

    useEffect(() => {
        const pending = timers.current

        return () => {
            clearTimer(pending, "show")
            clearTimer(pending, "hold")
            clearTimer(pending, "hide")
        }
    }, [])

    if (phase === "idle") return null

    return (
        <div
            className="ch-navprogress"
            data-on={entered && phase === "active" ? "" : undefined}
            data-done={phase === "done" ? "" : undefined}
            aria-hidden
        >
            <span />
        </div>
    )
}
