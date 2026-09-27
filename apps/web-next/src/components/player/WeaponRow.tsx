import { Card } from "@/components/ui/Card"
import { Collapse } from "@/components/ui/Collapse"
import { SplitProgress } from "@/components/ui/Progress"
import { StatGrid } from "@/components/ui/StatGrid"
import { percent, perGame, ratio } from "@/lib/stats"
import { calculateWinrate } from "@crh/bhapi/helpers/calculateWinrate"
import { formatTime } from "@crh/common/helpers/date"
import type { getWeaponsAccumulativeData } from "@crh/bhapi/legends"
import type { Stat } from "@/components/ui/StatGrid"
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
        <Collapse
            summary={
                <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2">
                        <span className="w-6 shrink-0 text-right text-xs text-textVar1">
                            {rank}
                        </span>
                        <span className="truncate font-semibold">
                            {weapon.weapon}
                        </span>
                    </span>
                    <span className="shrink-0 text-xs text-textVar1">
                        {display}
                    </span>
                </span>
            }
        >
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
                        { title: "KOs", value: weapon.kos.toLocaleString() },
                        {
                            title: "KOs per game",
                            value: perGame(weapon.kos, weapon.games).toFixed(2),
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

                <Card title="Games">
                    <p className="ch-display text-3xl">
                        {weapon.games.toLocaleString()}
                        <span className="ml-2 text-xs font-normal tracking-normal text-textVar1">
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
                            <span className="text-xs font-normal text-textVar1">
                                ({percent(weapon.wins, weapon.games).toFixed(2)}
                                %)
                            </span>
                        </span>
                        <span>
                            {(weapon.games - weapon.wins).toLocaleString()}L{" "}
                            <span className="text-xs font-normal text-textVar1">
                                (
                                {percent(
                                    weapon.games - weapon.wins,
                                    weapon.games,
                                ).toFixed(2)}
                                %)
                            </span>
                        </span>
                    </div>
                </Card>

                {rankedStats.length > 0 ? (
                    <Card title="Ranked season">
                        <StatGrid stats={rankedStats} />
                    </Card>
                ) : null}
            </div>
        </Collapse>
    )
}
