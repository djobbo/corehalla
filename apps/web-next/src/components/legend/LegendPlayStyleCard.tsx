import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
} from "@/components/ui/card"
import { SplitProgress } from "@/components/common/SplitProgress"
import { StatGrid } from "@/components/common/StatGrid"
import { fillClass } from "@/lib/fill"
import {
    formatPlayStyleMatchLength,
    formatPlayStylePerGame,
    formatPlayStyleShare,
    playStyleSample,
} from "@/lib/legendPlayStyle"
import { cn } from "@/lib/cn"
import type { LegendPlayStyle } from "@/lib/legendPlayStyle"
import type { Legend } from "@crh/bhapi/types"

const TITLE_ID = "legend-play-style-title"

export const LegendPlayStyleCard = ({
    legend,
    playStyle,
    className,
}: {
    readonly legend: Legend
    readonly playStyle: LegendPlayStyle
    readonly className?: string
}) => {
    const split =
        playStyle.weaponOneShare === null || playStyle.weaponTwoShare === null
            ? null
            : ([
                  {
                      key: "one",
                      weapon: legend.weapon_one,
                      share: playStyle.weaponOneShare,
                      intent: "blue",
                  },
                  {
                      key: "two",
                      weapon: legend.weapon_two,
                      share: playStyle.weaponTwoShare,
                      intent: "cyan",
                  },
              ] as const)

    return (
        <section aria-labelledby={TITLE_ID} className={className}>
            <Card className="gap-4">
                <CardHeader>
                    <h2
                        id={TITLE_ID}
                        className="text-xs font-extrabold tracking-[0.16em] uppercase text-muted-foreground"
                    >
                        How it plays
                    </h2>
                    <CardDescription className="text-xs">
                        {playStyleSample(playStyle.accounts)}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <StatGrid
                        maxColumns={3}
                        stats={[
                            {
                                title: "Damage dealt / game",
                                value: formatPlayStylePerGame(
                                    playStyle.damageDealtPerGame,
                                ),
                            },
                            {
                                title: "Damage taken / game",
                                value: formatPlayStylePerGame(
                                    playStyle.damageTakenPerGame,
                                ),
                            },
                            {
                                title: "KOs / game",
                                value: formatPlayStylePerGame(
                                    playStyle.kosPerGame,
                                ),
                            },
                            {
                                title: "Falls / game",
                                value: formatPlayStylePerGame(
                                    playStyle.fallsPerGame,
                                ),
                            },
                            {
                                title: "Suicides / 100 games",
                                value: formatPlayStylePerGame(
                                    playStyle.suicidesPer100Games,
                                ),
                            },
                            {
                                title: "Average match",
                                value: formatPlayStyleMatchLength(
                                    playStyle.averageMatchSeconds,
                                ),
                            },
                        ]}
                    />

                    {split === null ? null : (
                        <div className="flex flex-col gap-2">
                            <p className="ch-stat-label">Held weapon time</p>
                            <SplitProgress
                                label={`Held weapon time: ${formatPlayStyleShare(split[0].share)} on ${split[0].weapon}, ${formatPlayStyleShare(split[1].share)} on ${split[1].weapon}`}
                                parts={split.map((entry) => ({
                                    key: entry.key,
                                    value: entry.share,
                                    intent: entry.intent,
                                }))}
                            />
                            <ul className="flex flex-wrap gap-x-6 gap-y-1">
                                {split.map((entry) => (
                                    <li
                                        key={entry.key}
                                        className="flex items-center gap-2"
                                    >
                                        <span
                                            aria-hidden
                                            className={cn(
                                                "ch-dot",
                                                fillClass[entry.intent],
                                            )}
                                        />
                                        <span className="text-sm font-bold tabular-nums">
                                            {formatPlayStyleShare(entry.share)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {entry.weapon}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>
        </section>
    )
}
