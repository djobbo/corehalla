import { useEffect, useState } from "react"
import { formatRelativeTime } from "@crh/common/helpers/date"
import { cn } from "@/lib/cn"

export const UpdatedAt = ({
    at,
    className,
}: {
    /** Epoch ms of the oldest upstream read behind the response, not assemble time. */
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
            title={new Date(at).toISOString()}
            // Server and client clocks can disagree by a unit at a boundary.
            suppressHydrationWarning
        >
            Updated {formatRelativeTime(at, now)}
        </span>
    )
}
