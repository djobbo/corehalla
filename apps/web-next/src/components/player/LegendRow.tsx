import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { StatGrid } from "@/components/StatGrid"
import { EmptyRankedCard, RankedCard } from "./RankedCard"
import { percent, perGame, ratio } from "@/lib/stats"
import { getLegendEloReset } from "@crh/bhapi/calculator"
import { calculateWinrate } from "@crh/bhapi/helpers/calculateWinrate"
import { getTierFromRating } from "@crh/bhapi/helpers/getTierFromRating"
import { cleanString } from "@crh/common/helpers/cleanString"
import { formatTime } from "@crh/common/helpers/date"
import type { FullLegend } from "@crh/bhapi/legends"
import type { ReactNode } from "react"

/**
 * One legend's record, collapsed to a single line.
 *
 * The line answers the question the sort control is asking — it shows the figure
 * currently being sorted on, so scrolling the list reads as one ranked table
 * rather than sixty identical name rows.
 */
export const LegendRow = ({
    legend,
    rank,
    matchtime,
    games,
    display,
}: {
    readonly legend: FullLegend
    readonly rank: number
    readonly matchtime: number
    readonly games: number
    /** The sort function's display, so the visible figure is the sorted one. */
    readonly display?: ReactNode
}) => {
    const stats = legend.stats

    return (
        /*
         * The disclosure is Base UI's `Collapsible`, whose panel unmounts while
         * closed — the same property the old `<details>`-based collapse had, and
         * the reason it is safe to render one per legend. `Card` supplies the
         * surface the closed row sits on; `size="sm"` tightens the gap between
         * the trigger and the panel to the 0.75rem the old summary used.
         */
        <Card size="sm">
            <Collapsible>
                <CollapsibleTrigger className="flex w-full flex-1 items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-bgVar2 data-[panel-open]:shadow-[0_3px_0_0_var(--color-ink)]">
                    <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-2">
                            <span className="w-6 shrink-0 text-right text-xs text-muted-foreground">
                                {rank}
                            </span>
                            <span className="truncate font-semibold">
                                {legend.bio_name}
                            </span>
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                            {display}
                        </span>
                    </span>
                </CollapsibleTrigger>

                <CollapsibleContent className="bg-bgVar2 p-3.5">
                    <div className="flex flex-col gap-4">
                        <div className="grid gap-3 lg:grid-cols-2">
                            <StatGrid
                                stats={[
                                    {
                                        title: "Level",
                                        value: stats?.level ?? 0,
                                    },
                                    {
                                        title: "XP",
                                        value: (
                                            stats?.xp ?? 0
                                        ).toLocaleString(),
                                    },
                                    {
                                        title: "Time played",
                                        value: formatTime(
                                            stats?.matchtime ?? 0,
                                        ),
                                    },
                                    {
                                        title: "Time played (%)",
                                        value: `${percent(stats?.matchtime ?? 0, matchtime).toFixed(2)}%`,
                                    },
                                    {
                                        title: "Usage rate",
                                        value: `${percent(stats?.games ?? 0, games).toFixed(2)}%`,
                                    },
                                ]}
                            />
                            <StatGrid
                                stats={[
                                    {
                                        title: "KOs",
                                        value: (
                                            stats?.kos ?? 0
                                        ).toLocaleString(),
                                    },
                                    {
                                        title: "Falls",
                                        value: (
                                            stats?.falls ?? 0
                                        ).toLocaleString(),
                                    },
                                    {
                                        title: "Suicides",
                                        value: (
                                            stats?.suicides ?? 0
                                        ).toLocaleString(),
                                    },
                                    {
                                        title: "Team KOs",
                                        value: (
                                            stats?.teamkos ?? 0
                                        ).toLocaleString(),
                                    },
                                    {
                                        title: "Damage dealt",
                                        value: Number(
                                            stats?.damagedealt ?? 0,
                                        ).toLocaleString(),
                                    },
                                    {
                                        title: "Damage taken",
                                        value: Number(
                                            stats?.damagetaken ?? 0,
                                        ).toLocaleString(),
                                    },
                                    {
                                        title: "DPS",
                                        value: `${ratio(Number(stats?.damagedealt ?? 0), stats?.matchtime ?? 0).toFixed(2)} dmg/s`,
                                    },
                                    {
                                        title: "KOs per game",
                                        value: perGame(
                                            stats?.kos ?? 0,
                                            stats?.games ?? 0,
                                        ).toFixed(2),
                                    },
                                ]}
                            />
                        </div>

                        {legend.ranked ? (
                            <RankedCard
                                title="Ranked season"
                                tier={legend.ranked.tier}
                                rating={legend.ranked.rating}
                                peakRating={legend.ranked.peak_rating}
                                wins={legend.ranked.wins}
                                games={legend.ranked.games}
                                stats={[
                                    {
                                        title: "Games",
                                        value: legend.ranked.games.toLocaleString(),
                                    },
                                    {
                                        title: "Winrate",
                                        value: `${calculateWinrate(
                                            legend.ranked.wins,
                                            legend.ranked.games,
                                        ).toFixed(2)}%`,
                                    },
                                    {
                                        title: "Elo reset",
                                        value: `${getLegendEloReset(legend.ranked.rating)} · ${getTierFromRating(
                                            getLegendEloReset(
                                                legend.ranked.rating,
                                            ),
                                        )}`,
                                    },
                                ]}
                            />
                        ) : (
                            <EmptyRankedCard label="Not played in ranked this season." />
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Weapons</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="flex flex-wrap gap-1.5">
                                    {[legend.weapon_one, legend.weapon_two].map(
                                        (weapon) => (
                                            <li
                                                key={weapon}
                                                className="ch-chip ch-chip-off"
                                            >
                                                {cleanString(weapon)}
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    )
}
