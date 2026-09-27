import { Card } from "@/components/ui/Card"
import { SplitProgress } from "@/components/ui/Progress"
import { StatGrid } from "@/components/ui/StatGrid"
import { rankedBannerSrc, regionFlagSrc } from "@/lib/assets"
import { tierColor } from "@/lib/rankings"
import { percent } from "@/lib/stats"
import type { Stat } from "@/components/ui/StatGrid"
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
         * own `z-index`. No `overflow-hidden`, so the banner can overhang.
         */
        <Card className="relative z-0">
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

            <div className="mt-3 flex flex-col">
                <span className="ch-display text-3xl">
                    {rating.toLocaleString()}
                    <span className="ml-2 text-sm font-normal tracking-normal text-textVar1">
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
                        <span className="text-xs font-normal text-textVar1">
                            ({percent(wins, games).toFixed(2)}%)
                        </span>
                    </span>
                    <span>
                        {losses.toLocaleString()}L{" "}
                        <span className="text-xs font-normal text-textVar1">
                            ({percent(losses, games).toFixed(2)}%)
                        </span>
                    </span>
                </div>
            </div>

            {stats && (
                <Card variant="inset" className="mt-3">
                    <StatGrid stats={stats} />
                </Card>
            )}
        </Card>
    )
}

/** The stand-in for a ranked panel with no record to show. */
export const EmptyRankedCard = ({ label }: { readonly label: string }) => (
    <Card variant="muted" className="grid place-items-center py-10">
        <p className="text-sm text-textVar1">{label}</p>
    </Card>
)
