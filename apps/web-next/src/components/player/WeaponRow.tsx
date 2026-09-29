import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { SplitProgress } from "@/components/SplitProgress"
import { StatGrid } from "@/components/StatGrid"
import { percent, perGame, ratio } from "@/lib/stats"
import { calculateWinrate } from "@crh/bhapi/helpers/calculateWinrate"
import { formatTime } from "@crh/common/helpers/date"
import type { PlayerLegend, PlayerWeapon } from "@crh/api-contract/schemas"
import type { Stat } from "@/components/StatGrid"
import type { ReactNode } from "react"

/** A legend that has a ranked record, paired with that record. */
type RankedLegend = {
    readonly legend: PlayerLegend
    readonly ranked: NonNullable<PlayerLegend["ranked"]>
}

/**
 * The ranked record a weapon implies.
 *
 * A weapon has no ranked record of its own — it is played through legends — so
 * this rolls the legends that use it into one. The averages divide by the number
 * of legends that actually have a ranked record, not by every legend holding the
 * weapon, because a level-1 legend dragging the average toward zero is noise.
 *
 * The API sends each weapon's legends as references (id, name, their share of
 * the weapon); the ranked record lives on the legend itself, so the two are
 * joined here. That is a lookup, not a second aggregation: every number this
 * returns is read, not recomputed.
 */
const rankedSummary = (
    weapon: PlayerWeapon,
    legends: ReadonlyMap<number, PlayerLegend>,
) => {
    const rankedLegends: RankedLegend[] = weapon.legends.flatMap((entry) => {
        const legend = legends.get(entry.id)

        return legend?.ranked ? [{ legend, ranked: legend.ranked }] : []
    })

    return rankedLegends.reduce(
        (acc, entry) => ({
            games: acc.games + entry.ranked.games,
            wins: acc.wins + entry.ranked.wins,
            totalRating: acc.totalRating + entry.ranked.rating,
            totalPeakRating: acc.totalPeakRating + entry.ranked.peak_rating,
            count: acc.count + 1,
            mostPlayed:
                (acc.mostPlayed?.ranked.games ?? 0) < entry.ranked.games
                    ? entry
                    : acc.mostPlayed,
            highestRated:
                (acc.highestRated?.ranked.rating ?? 0) < entry.ranked.rating
                    ? entry
                    : acc.highestRated,
        }),
        {
            games: 0,
            wins: 0,
            totalRating: 0,
            totalPeakRating: 0,
            count: 0,
            mostPlayed: undefined as RankedLegend | undefined,
            highestRated: undefined as RankedLegend | undefined,
        },
    )
}

/**
 * One weapon's record, collapsed to a single line.
 *
 * Same contract as `LegendRow`: the collapsed line shows the figure currently
 * being sorted on, so the list reads as a ranked table.
 */
export const WeaponRow = ({
    weapon,
    legends,
    rank,
    matchtime,
    games,
    display,
}: {
    readonly weapon: PlayerWeapon
    /** The profile's legends by id, for resolving each weapon legend's ranking. */
    readonly legends: ReadonlyMap<number, PlayerLegend>
    readonly rank: number
    readonly matchtime: number
    readonly games: number
    readonly display?: ReactNode
}) => {
    const stats = weapon.stats
    const ranked = rankedSummary(weapon, legends)

    const rankedStats: Stat[] = ranked.count
        ? [
              { title: "Ranked games", value: ranked.games.toLocaleString() },
              { title: "Ranked wins", value: ranked.wins.toLocaleString() },
              {
                  title: "Ranked losses",
                  value: (ranked.games - ranked.wins).toLocaleString(),
              },
              {
                  title: "Ranked winrate",
                  value: `${calculateWinrate(ranked.wins, ranked.games).toFixed(2)}%`,
              },
              {
                  title: "Average elo",
                  value: ratio(ranked.totalRating, ranked.count).toFixed(0),
              },
              {
                  title: "Average peak elo",
                  value: ratio(ranked.totalPeakRating, ranked.count).toFixed(0),
              },
              {
                  title: "Most played",
                  value: ranked.mostPlayed
                      ? `${ranked.mostPlayed.legend.name} · ${ranked.mostPlayed.ranked.games}`
                      : "—",
              },
              {
                  title: "Highest elo",
                  value: ranked.highestRated
                      ? `${ranked.highestRated.legend.name} · ${ranked.highestRated.ranked.rating}`
                      : "—",
              },
          ]
        : []

    return (
        /*
         * Same disclosure contract as `LegendRow`: Base UI's `Collapsible`
         * mounts the panel only while it is open, which is what makes one
         * instance per weapon cheap, and `Card` is the slab the collapsed row
         * sits on.
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
                                {weapon.name}
                            </span>
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                            {display}
                        </span>
                    </span>
                </CollapsibleTrigger>

                <CollapsibleContent className="bg-bgVar2 p-3.5">
                    <div className="flex flex-col gap-4">
                        <StatGrid
                            stats={[
                                { title: "Weapon level", value: stats.level },
                                {
                                    title: "Avg. legend level",
                                    value: ratio(
                                        stats.level,
                                        weapon.legends.length,
                                    ).toFixed(0),
                                },
                                {
                                    title: "Weapon XP",
                                    value: stats.xp.toLocaleString(),
                                },
                                {
                                    title: "Avg. legend XP",
                                    value: ratio(
                                        stats.xp,
                                        weapon.legends.length,
                                    ).toFixed(0),
                                },
                                {
                                    title: "Time held",
                                    value: formatTime(stats.time_held),
                                },
                                {
                                    title: "Time held (%)",
                                    value: `${percent(stats.time_held, matchtime).toFixed(2)}%`,
                                },
                                {
                                    title: "Usage rate",
                                    value: `${percent(stats.games, games).toFixed(2)}%`,
                                },
                                {
                                    title: "KOs",
                                    value: stats.kos.toLocaleString(),
                                },
                                {
                                    title: "KOs per game",
                                    value: perGame(
                                        stats.kos,
                                        stats.games,
                                    ).toFixed(2),
                                },
                                {
                                    title: "Damage dealt",
                                    value: stats.damage_dealt.toLocaleString(),
                                },
                                {
                                    title: "DPS",
                                    value: `${ratio(stats.damage_dealt, stats.time_held).toFixed(2)} dmg/s`,
                                },
                                {
                                    title: "Damage per game",
                                    value: perGame(
                                        stats.damage_dealt,
                                        stats.games,
                                    ).toFixed(2),
                                },
                            ]}
                        />

                        <Card>
                            <CardHeader>
                                <CardTitle>Games</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="ch-display text-3xl">
                                    {stats.games.toLocaleString()}
                                    <span className="ml-2 text-xs font-normal tracking-normal text-muted-foreground">
                                        games
                                    </span>
                                </p>
                                <SplitProgress
                                    className="mt-3"
                                    parts={[
                                        {
                                            key: "wins",
                                            value: stats.wins,
                                            intent: "green",
                                        },
                                        {
                                            key: "losses",
                                            value: stats.games - stats.wins,
                                            intent: "orange",
                                        },
                                    ]}
                                />
                                <div className="mt-2 flex justify-between text-sm font-bold">
                                    <span>
                                        {stats.wins.toLocaleString()}W{" "}
                                        <span className="text-xs font-normal text-muted-foreground">
                                            (
                                            {percent(
                                                stats.wins,
                                                stats.games,
                                            ).toFixed(2)}
                                            %)
                                        </span>
                                    </span>
                                    <span>
                                        {(
                                            stats.games - stats.wins
                                        ).toLocaleString()}
                                        L{" "}
                                        <span className="text-xs font-normal text-muted-foreground">
                                            (
                                            {percent(
                                                stats.games - stats.wins,
                                                stats.games,
                                            ).toFixed(2)}
                                            %)
                                        </span>
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {rankedStats.length > 0 ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ranked season</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <StatGrid stats={rankedStats} />
                                </CardContent>
                            </Card>
                        ) : null}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    )
}
