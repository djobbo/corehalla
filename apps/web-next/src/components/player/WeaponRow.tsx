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
import type { getWeaponsAccumulativeData } from "@crh/bhapi/legends"
import type { Stat } from "@/components/StatGrid"
import type { ReactNode } from "react"

/** One row of `getWeaponsAccumulativeData` — a weapon plus its totals. */
export type WeaponStats = ReturnType<typeof getWeaponsAccumulativeData>[number]

/**
 * The ranked record a weapon implies.
 *
 * A weapon has no ranked record of its own — it is played through legends — so
 * this rolls the legends that use it into one. The averages divide by the number
 * of legends that actually have a ranked record, not by every legend holding the
 * weapon, because a level-1 legend dragging the average toward zero is noise.
 */
const rankedSummary = (weapon: WeaponStats) => {
    const empty = {
        games: 0,
        wins: 0,
        totalRating: 0,
        totalPeakRating: 0,
        count: 0,
        mostPlayed: undefined as WeaponStats["legends"][number] | undefined,
        highestRated: undefined as WeaponStats["legends"][number] | undefined,
    }

    return weapon.legends.reduce((acc, legend) => {
        if (!legend.ranked) return acc

        return {
            games: acc.games + legend.ranked.games,
            wins: acc.wins + legend.ranked.wins,
            totalRating: acc.totalRating + legend.ranked.rating,
            totalPeakRating: acc.totalPeakRating + legend.ranked.peak_rating,
            count: acc.count + 1,
            mostPlayed:
                (acc.mostPlayed?.ranked?.games ?? 0) < legend.ranked.games
                    ? legend
                    : acc.mostPlayed,
            highestRated:
                (acc.highestRated?.ranked?.rating ?? 0) < legend.ranked.rating
                    ? legend
                    : acc.highestRated,
        }
    }, empty)
}

/**
 * One weapon's record, collapsed to a single line.
 *
 * Same contract as `LegendRow`: the collapsed line shows the figure currently
 * being sorted on, so the list reads as a ranked table.
 */
export const WeaponRow = ({
    weapon,
    rank,
    matchtime,
    games,
    display,
}: {
    readonly weapon: WeaponStats
    readonly rank: number
    readonly matchtime: number
    readonly games: number
    readonly display?: ReactNode
}) => {
    const ranked = rankedSummary(weapon)

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
                      ? `${ranked.mostPlayed.bio_name} · ${ranked.mostPlayed.ranked?.games ?? 0}`
                      : "—",
              },
              {
                  title: "Highest elo",
                  value: ranked.highestRated
                      ? `${ranked.highestRated.bio_name} · ${ranked.highestRated.ranked?.rating ?? 0}`
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
                                {weapon.weapon}
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
                                { title: "Weapon level", value: weapon.level },
                                {
                                    title: "Avg. legend level",
                                    value: ratio(
                                        weapon.level,
                                        weapon.legends.length,
                                    ).toFixed(0),
                                },
                                {
                                    title: "Weapon XP",
                                    value: weapon.xp.toLocaleString(),
                                },
                                {
                                    title: "Avg. legend XP",
                                    value: ratio(
                                        weapon.xp,
                                        weapon.legends.length,
                                    ).toFixed(0),
                                },
                                {
                                    title: "Time held",
                                    value: formatTime(weapon.matchtime),
                                },
                                {
                                    title: "Time held (%)",
                                    value: `${percent(weapon.matchtime, matchtime).toFixed(2)}%`,
                                },
                                {
                                    title: "Usage rate",
                                    value: `${percent(weapon.games, games).toFixed(2)}%`,
                                },
                                {
                                    title: "KOs",
                                    value: weapon.kos.toLocaleString(),
                                },
                                {
                                    title: "KOs per game",
                                    value: perGame(
                                        weapon.kos,
                                        weapon.games,
                                    ).toFixed(2),
                                },
                                {
                                    title: "Damage dealt",
                                    value: weapon.damageDealt.toLocaleString(),
                                },
                                {
                                    title: "DPS",
                                    value: `${ratio(weapon.damageDealt, weapon.matchtime).toFixed(2)} dmg/s`,
                                },
                                {
                                    title: "Damage per game",
                                    value: perGame(
                                        weapon.damageDealt,
                                        weapon.games,
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
                                    {weapon.games.toLocaleString()}
                                    <span className="ml-2 text-xs font-normal tracking-normal text-muted-foreground">
                                        games
                                    </span>
                                </p>
                                <SplitProgress
                                    className="mt-3"
                                    parts={[
                                        {
                                            key: "wins",
                                            value: weapon.wins,
                                            intent: "green",
                                        },
                                        {
                                            key: "losses",
                                            value: weapon.games - weapon.wins,
                                            intent: "orange",
                                        },
                                    ]}
                                />
                                <div className="mt-2 flex justify-between text-sm font-bold">
                                    <span>
                                        {weapon.wins.toLocaleString()}W{" "}
                                        <span className="text-xs font-normal text-muted-foreground">
                                            (
                                            {percent(
                                                weapon.wins,
                                                weapon.games,
                                            ).toFixed(2)}
                                            %)
                                        </span>
                                    </span>
                                    <span>
                                        {(
                                            weapon.games - weapon.wins
                                        ).toLocaleString()}
                                        L{" "}
                                        <span className="text-xs font-normal text-muted-foreground">
                                            (
                                            {percent(
                                                weapon.games - weapon.wins,
                                                weapon.games,
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
