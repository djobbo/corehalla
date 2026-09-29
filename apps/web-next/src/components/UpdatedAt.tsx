import { useEffect, useState } from "react"
import { formatRelativeTime } from "@crh/common/helpers/date"
import { cn } from "@/lib/cn"

/**
 * When the data on a page was last fetched, as a relative time.
 *
 * This reports `meta.updated_at`, which is the **oldest** upstream read behind
 * the response rather than the moment it was assembled — so "Updated 4 minutes
 * ago" is a statement about the least-current fact on the page, not a
 * best-case claim about the newest one.
 *
 * ## Why it re-renders
 *
 * The text is derived from the clock, so a page left open would otherwise keep
 * saying "12 seconds ago" long after it stopped being true. A half-minute tick
 * is the resolution of the shortest unit that is not "just now", which is
 * enough for the wording to stay honest without a per-second timer.
 *
 * ## Why hydration is suppressed
 *
 * The server and the browser format against their own clocks, so the first
 * client render can legitimately differ by a unit at a boundary. The server's
 * text is kept and the tick corrects it immediately; warning about that would
 * be noise.
 */
export const UpdatedAt = ({
    at,
    className,
}: {
    /** Epoch milliseconds, from the response envelope's `meta.updated_at`. */
    readonly at: number
    readonly className?: string
}) => {
    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 30_000)

        return () => clearInterval(timer)
    }, [])

    return (
        <span
            className={cn("text-xs text-muted-foreground", className)}
            // The absolute instant, for anyone who needs the exact time rather
            // than a rounded one.
            title={new Date(at).toISOString()}
            suppressHydrationWarning
        >
            Updated {formatRelativeTime(at, now)}
        </span>
    )
}
