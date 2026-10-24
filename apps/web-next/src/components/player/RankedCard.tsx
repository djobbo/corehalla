import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SplitProgress } from "@/components/common/SplitProgress"
import { StatGrid } from "@/components/common/StatGrid"
import { regionFlagSrc } from "@/lib/assets"
import { useRankedBanner } from "@/lib/media"
import { tierColor } from "@/lib/rankings"
import { percent } from "@/lib/stats"
import type { Stat } from "@/components/common/StatGrid"
import type { CSSProperties, ReactNode } from "react"

export const RankedCard = ({
    title,
    tier,
    region,
    rating,
    peakRating,
    wins,
    games,
    stats,
    meta,
}: {
    readonly title: string
    readonly tier?: string | null
    readonly region?: string | null
    readonly rating: number
    readonly peakRating: number
    readonly wins: number
    readonly games: number
    readonly stats?: readonly Stat[]
    readonly meta?: ReactNode
}) => {
    const losses = games - wins

    const tierLabel = tier ?? "Valhallan"
    const banner = useRankedBanner(tierLabel)

    return (
        <Card className="relative z-0 overflow-visible">
            <img src={banner} alt="" aria-hidden className="ch-card-banner" />
            <CardHeader>
                <CardTitle className="sr-only">{title}</CardTitle>
                <div className="flex flex-wrap items-center gap-2 pr-12">
                    <div className="ch-nameplate">
                        {region ? (
                            <img
                                src={regionFlagSrc(region)}
                                alt={`${region.toUpperCase()} region`}
                                title={`${region.toUpperCase()} region`}
                                className="ch-nameplate-flag"
                            />
                        ) : null}
                        <div className="ch-nameplate-names">
                            <h3>{title}</h3>
                        </div>
                    </div>
                    <span
                        className="ch-tier shrink-0"
                        style={
                            {
                                "--ch-tier": tierColor(tierLabel),
                            } as CSSProperties
                        }
                    >
                        {tierLabel}
                    </span>
                    {meta}
                </div>
            </CardHeader>
            <CardContent className="flex flex-col">
                <span className="ch-display text-3xl">
                    {rating.toLocaleString()}
                    <span className="ml-2 text-sm font-normal tracking-normal text-muted-foreground">
                        / {peakRating.toLocaleString()} peak
                    </span>
                </span>
                <SplitProgress
                    className="mt-2"
                    parts={[
                        { key: "wins", value: wins, intent: "green" },
                        { key: "losses", value: losses, intent: "orange" },
                    ]}
                />
                <div className="mt-1.5 flex justify-between text-sm font-bold">
                    <span>
                        {wins.toLocaleString()}W{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                            ({percent(wins, games).toFixed(2)}%)
                        </span>
                    </span>
                    <span>
                        {losses.toLocaleString()}L{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                            ({percent(losses, games).toFixed(2)}%)
                        </span>
                    </span>
                </div>
                {stats && <StatGrid className="mt-3" stats={stats} />}
            </CardContent>
        </Card>
    )
}

export const EmptyRankedCard = ({ label }: { readonly label: string }) => (
    <Card className="bg-bgVar2">
        <CardContent className="grid place-items-center py-10">
            <p className="text-sm text-muted-foreground">{label}</p>
        </CardContent>
    </Card>
)
