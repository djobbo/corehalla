import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SplitProgress } from "@/components/SplitProgress"
import { StatGrid } from "@/components/StatGrid"
import { rankedBannerSrc, regionFlagSrc } from "@/lib/assets"
import { tierColor } from "@/lib/rankings"
import { percent } from "@/lib/stats"
import type { Stat } from "@/components/StatGrid"
import type { CSSProperties, ReactNode } from "react"

/**
 * A ranked record at a glance: tier, rating against peak, win split, and a
 * nested grid of the figures that qualify it.
 *
 * Shared by the 1v1 and 2v2 panels on the overview and by each legend's ranked
 * section, because all three are the same shape — a rating, a peak, a win
 * ratio and a handful of derived numbers. Keeping it one component is what keeps
 * "what a ranked record looks like" a single decision, banner and nameplate
 * included.
 */
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
    /** Fills the nameplate's left end, the way it does on a team card. */
    readonly region?: string | null
    readonly rating: number
    readonly peakRating: number
    readonly wins: number
    readonly games: number
    readonly stats?: readonly Stat[]
    /** Sits next to the tier chip — a teammate count. */
    readonly meta?: ReactNode
}) => {
    const losses = games - wins

    /*
     * The API has no "Valhallan" tier value — it reports the top tier as `null`
     * — so the label is resolved once here and both the banner and the chip are
     * given it. Without this the banner would show a Valhallan banner beside a
     * chip reading "Unranked".
     */
    const tierLabel = tier ?? "Valhallan"

    return (
        /*
         * `relative z-0` is what the banner needs: `relative` to be its
         * containing block, `z-0` so its stacking context scopes the banner's
         * own `z-index`. `overflow-visible` undoes the `Card`'s default clip,
         * because the banner deliberately overhangs the card's top and right.
         */
        <Card className="relative z-0 overflow-visible">
            <img
                src={rankedBannerSrc(tierLabel)}
                alt=""
                aria-hidden
                className="ch-card-banner"
            />

            {/*
             * The title rides on a nameplate, the same one a team card uses: a
             * slanted accent plate with the region flag filling its left end.
             * The chip and the meta tag follow it rather than sitting on the
             * right, which the banner has taken.
             *
             * The flag is optional because not every ranked record has a region
             * — a legend's ranked section carries none — and a missing flag is
             * a shorter plate rather than a hole.
             *
             * `pr-12` keeps the chip and the meta tag out of the banner's
             * corner. The plate reserves it for itself, but these two follow the
             * plate and would otherwise run underneath.
             */}
            <CardHeader>
                {/*
                 * The visible title is the nameplate's own `<h3>`, because that
                 * is where it is legible. This carries the same title in
                 * shadcn's heading vocabulary, so the card is announceable
                 * without the plate's type treatment being repainted.
                 */}
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

                {/*
                 * The losses figure steps out from under the banner only when
                 * the banner is tall enough to reach this row — Diamond and up.
                 * For the shorter tiers the row stays flush right, which keeps
                 * it aligned with the bar above.
                 */}
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

                {stats && (
                    <Card className="mt-3 bg-background">
                        <CardContent>
                            <StatGrid stats={stats} />
                        </CardContent>
                    </Card>
                )}
            </CardContent>
        </Card>
    )
}

/** The stand-in for a ranked panel with no record to show. */
export const EmptyRankedCard = ({ label }: { readonly label: string }) => (
    <Card className="bg-bgVar2">
        <CardContent className="grid place-items-center py-10">
            <p className="text-sm text-muted-foreground">{label}</p>
        </CardContent>
    </Card>
)
