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

/** Shortest visible time so a fast response still reads as a transition. */
const MIN_VISIBLE_MS = 240

const EXIT_MS = 560

type Phase = "idle" | "loading" | "exiting"

type PageLoaderState = {
    readonly phase: Phase
    readonly begin: () => void
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

    const waiting = useRef(0)
    const shownAt = useRef(0)
    const timers = useRef<Timers>({})

    const commit = useCallback((next: Phase) => {
        phaseRef.current = next
        setPhase(next)
    }, [])

    const begin = useCallback(() => {
        waiting.current += 1

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

            if (waiting.current > 0) return

            commit("exiting")

            timers.current.reset = window.setTimeout(() => {
                delete timers.current.reset

                if (waiting.current > 0) return

                commit("idle")
            }, EXIT_MS)
        }, hold)
    }, [commit])

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

/** Renders nothing; mounts beside the overlay so exit animation can outlive Suspense. */
export const PageLoaderProbe = () => {
    const loader = useContext(PageLoaderContext)

    useEffect(() => {
        if (loader === null) return

        loader.begin()

        return loader.end
    }, [loader])

    return null
}

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

    const [entered, setEntered] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        void ref.current?.getBoundingClientRect()

        const frame = requestAnimationFrame(() => setEntered(true))

        return () => cancelAnimationFrame(frame)
    }, [])

    const canCancel = router.history.canGoBack()

    const cancel = useCallback(() => {
        router.history.back()
    }, [router])

    return (
        <div
            ref={ref}
            className="ch-pageloader"
            data-phase={phase}
            data-entered={entered ? "" : undefined}
        >
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
