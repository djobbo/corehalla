import { cn } from "@/lib/cn"

export const RankPosition = ({
    region,
    regionalRank,
    globalRank,
    className,
}: {
    readonly region?: string | null
    readonly regionalRank?: number | null
    readonly globalRank?: number | null
    readonly className?: string
}) => {
    const parts: string[] = []

    if (
        regionalRank !== null &&
        regionalRank !== undefined &&
        regionalRank > 0
    ) {
        parts.push(
            `#${regionalRank.toLocaleString()} ${region ? region.toUpperCase() : "regional"}`,
        )
    }

    if (globalRank !== null && globalRank !== undefined && globalRank > 0) {
        parts.push(`#${globalRank.toLocaleString()} global`)
    }

    if (parts.length === 0) return null

    return (
        <p
            className={cn(
                "text-xs font-extrabold tracking-[0.12em] text-ring uppercase",
                className,
            )}
        >
            {parts.join(" · ")}
        </p>
    )
}
