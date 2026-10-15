import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Breakdown } from "@/components/common/Breakdown"
import { SplitProgress } from "@/components/common/SplitProgress"
import { StatGrid } from "@/components/common/StatGrid"
import { RankedCard } from "./RankedCard"
import { LegendBubbleChart } from "@/components/charts/LegendBubbleChart"
import { WeaponBubbleChart } from "@/components/charts/WeaponBubbleChart"
import { playerProfileAtom, useQuery } from "@/effect/atoms"
import { cn } from "@/lib/cn"
import { percent, perGame, ratio } from "@/lib/stats"
import { formatTime } from "@crh/common/helpers/date"
import type { Stat } from "@/components/common/StatGrid"
import type { BreakdownEntry } from "@/components/common/Breakdown"
import type { Player, PlayerRankedTeam } from "@crh/api-contract/schemas"

type RankedBracket = NonNullable<NonNullable<Player["ranked"]>["1v1"]>

type Team = PlayerRankedTeam

const Ranked1v1Panel = ({
    ranked,
}: {
    readonly ranked: RankedBracket | null
}) => {
    if (!ranked || ranked.games <= 0) return null

    return (
        <RankedCard
            title="Ranked 1v1"
            tier={ranked.tier}
            region={ranked.region}
            rating={ranked.rating}
            peakRating={ranked.peak_rating}
            wins={ranked.wins}
            games={ranked.games}
        />
    )
}

const SoloQueuePanel = ({ solo }: { readonly solo: Team }) => {
    const region = solo.region

    return (
        <RankedCard
            title="Solo queue"
            tier={solo.tier}
            region={region}
            rating={solo.rating}
            peakRating={solo.peak_rating}
            wins={solo.wins}
            games={solo.games}
        />
    )
}

const Ranked3v3Panel = ({
    ranked,
}: {
    readonly ranked: RankedBracket | null
}) => {
    if (!ranked || ranked.games <= 0) return null

    return (
        <RankedCard
            title="Ranked 3v3"
            tier={ranked.tier}
            region={ranked.region}
            rating={ranked.rating}
            peakRating={ranked.peak_rating}
            wins={ranked.wins}
            games={ranked.games}
        />
    )
}

const GamesPanel = ({
    games,
    wins,
}: {
    readonly games: number
    readonly wins: number
}) => (
    <Card>
        <CardHeader>
            <CardTitle>Games</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="ch-display text-4xl">
                {games.toLocaleString()}
                <span className="ml-2 text-xs font-normal tracking-normal text-muted-foreground">
                    games
                </span>
            </p>
            <SplitProgress
                className="mt-3"
                parts={[
                    { key: "wins", value: wins, intent: "green" },
                    { key: "losses", value: games - wins, intent: "orange" },
                ]}
            />
            <div className="mt-2 flex justify-between text-sm font-bold">
                <span>
                    {wins.toLocaleString()}W{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                        ({percent(wins, games).toFixed(2)}%)
                    </span>
                </span>
                <span>
                    {(games - wins).toLocaleString()}L{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                        ({percent(games - wins, games).toFixed(2)}%)
                    </span>
                </span>
            </div>
        </CardContent>
    </Card>
)

const KosFallsPanel = ({
    kos,
    falls,
    suicides,
    teamKos,
    weaponKos,
    thrownKos,
    unarmed,
    gadgets,
}: {
    readonly kos: number
    readonly falls: number
    readonly suicides: number
    readonly teamKos: number
    readonly weaponKos: number
    readonly thrownKos: number
    readonly unarmed: Player["unarmed"]
    readonly gadgets: Player["gadgets"]
}) => {
    const koed = Math.max(0, falls - suicides)
    // Shared scale so KO and fall bars are comparable at a glance.
    const sharedMax = Math.max(kos, falls)

    return (
        <Card>
            <CardHeader>
                <CardTitle>KOs &amp; Falls</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-6">
                    <Breakdown
                        title="Total KOs"
                        total={kos}
                        max={sharedMax}
                        entries={[
                            {
                                key: "weapons",
                                label: "using weapons",
                                value: weaponKos,
                                intent: "blue",
                            },
                            {
                                key: "unarmed",
                                label: "unarmed",
                                value: unarmed.kos,
                                intent: "cyan",
                            },
                            {
                                key: "gadgets",
                                label: "using gadgets",
                                value: gadgets.kos,
                                intent: "green",
                            },
                            {
                                key: "throws",
                                label: "using throws",
                                // Thrown-item KOs are derived (v1 has no counter).
                                value: thrownKos,
                                intent: "yellow",
                            },
                            {
                                key: "teamKos",
                                label: "team KOs",
                                value: teamKos,
                                intent: "pink",
                            },
                        ]}
                    />

                    {/* Falls are only KOed or suicide; team KOs never count as falls. */}
                    <Breakdown
                        title="Falls"
                        total={falls}
                        max={sharedMax}
                        entries={[
                            {
                                key: "koed",
                                label: "KOed",
                                value: koed,
                                intent: "orange",
                            },
                            {
                                key: "suicides",
                                label: "Suicides",
                                value: suicides,
                                intent: "yellow",
                            },
                        ]}
                    />
                </div>
            </CardContent>
        </Card>
    )
}

const DamagePanel = ({
    dealt,
    taken,
    matchtime,
    weaponDamage,
    unarmed,
    gadgets,
    throws,
}: {
    readonly dealt: number
    readonly taken: number
    readonly matchtime: number
    readonly weaponDamage: number
    readonly unarmed: Player["unarmed"]
    readonly gadgets: Player["gadgets"]
    readonly throws: Player["weapon_throws"]
}) => {
    // Shared scale so dealt/taken compare by eye; hollow slot is self-damage (no counter).
    const sharedMax = Math.max(dealt, taken)

    const dealtEntries: BreakdownEntry[] = [
        {
            key: "weapons",
            label: "using weapons",
            value: weaponDamage,
            intent: "blue",
        },
        {
            key: "unarmed",
            label: "unarmed",
            value: unarmed.damage_dealt,
            intent: "cyan",
        },
        {
            key: "gadgets",
            label: "using gadgets",
            value: gadgets.damage_dealt,
            intent: "green",
        },
        {
            key: "throws",
            label: "using throws",
            value: throws.damage_dealt,
            intent: "yellow",
        },
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>Damage</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-6">
                    <Breakdown
                        title="Damage dealt"
                        total={dealt}
                        max={sharedMax}
                        entries={dealtEntries}
                    />

                    <Breakdown
                        title="Damage taken"
                        total={taken}
                        max={sharedMax}
                        entries={[
                            {
                                key: "taken",
                                label: "taken",
                                value: taken,
                                intent: "orange",
                            },
                        ]}
                    />
                </div>
                <Card className="mt-4 bg-background">
                    <CardContent>
                        <StatGrid
                            stats={[
                                {
                                    title: "Dealt per second",
                                    value: `${ratio(dealt, matchtime).toFixed(1)} dmg/s`,
                                },
                                {
                                    title: "Taken per second",
                                    value: `${ratio(taken, matchtime).toFixed(1)} dmg/s`,
                                },
                            ]}
                        />
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    )
}

const BreakdownPanel = ({
    title,
    stats,
}: {
    readonly title: string
    readonly stats: readonly Stat[]
}) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <StatGrid stats={stats} />
        </CardContent>
    </Card>
)

export const OverviewTab = ({ playerId }: { readonly playerId: number }) => {
    const profile = useQuery(playerProfileAtom(playerId)).data

    const {
        stats,
        ranked,
        unarmed,
        gadgets,
        weapon_throws: throws,
        weapon_kos: weaponKos,
        thrown_kos: thrownKos,
        weapon_damage: weaponDamage,
    } = profile

    const {
        games,
        wins,
        matchtime,
        kos,
        falls,
        suicides,
        team_kos: teamKos,
        damage_dealt: damageDealt,
        damage_taken: damageTaken,
    } = stats

    const ranked1v1 = ranked?.["1v1"] ?? null
    const ranked3v3 = ranked?.["3v3"] ?? null
    const soloRecord = ranked?.["2v2"]?.teams.find((team) => !team.paired)
    const has1v1 = ranked1v1 !== null
    const has3v3 = ranked3v3 !== null

    const hasLegendPlay = profile.legends.some(
        (legend) => legend.stats.games > 0,
    )
    const hasWeaponPlay =
        profile.weapons.some((weapon) => weapon.stats.games > 0) ||
        profile.unarmed.time_held > 0

    // Games is always drawn, so the widest row is games + both distributions.
    const distributionCount = 1 + Number(hasLegendPlay) + Number(hasWeaponPlay)

    const rankedCardCount = [has1v1, soloRecord !== undefined, has3v3].filter(
        Boolean,
    ).length

    const koCounts = (weapon: {
        kos: number
        damage_dealt: number
    }): Stat[] => [
        { title: "KOs", value: weapon.kos.toLocaleString() },
        {
            title: "One KO every",
            value: `${ratio(games, weapon.kos).toFixed(1)} games`,
        },
        { title: "Damage dealt", value: weapon.damage_dealt.toLocaleString() },
        {
            title: "Avg. damage per game",
            value: perGame(weapon.damage_dealt, games).toFixed(2),
        },
    ]

    return (
        <div className="flex flex-col gap-4">
            {rankedCardCount > 0 ? (
                <div
                    className={cn(
                        "grid gap-4",
                        rankedCardCount > 1 && "@2xl:grid-cols-2",
                        rankedCardCount > 2 && "@4xl:grid-cols-3",
                    )}
                >
                    <Ranked1v1Panel ranked={ranked1v1} />
                    {soloRecord ? <SoloQueuePanel solo={soloRecord} /> : null}
                    <Ranked3v3Panel ranked={ranked3v3} />
                </div>
            ) : null}
            <div
                className={cn(
                    "grid gap-4",
                    distributionCount === 2 && "@2xl:grid-cols-2",
                    distributionCount > 2 &&
                        "@2xl:grid-cols-2 @4xl:grid-cols-3",
                )}
            >
                <GamesPanel games={games} wins={wins} />
                {hasLegendPlay ? (
                    <Card>
                        <CardContent>
                            <LegendBubbleChart legends={profile.legends} />
                        </CardContent>
                    </Card>
                ) : null}
                {hasWeaponPlay ? (
                    <Card>
                        <CardContent>
                            <WeaponBubbleChart
                                weapons={profile.weapons}
                                unarmed={profile.unarmed}
                            />
                        </CardContent>
                    </Card>
                ) : null}
            </div>
            <div className="grid gap-4 @2xl:grid-cols-2">
                <KosFallsPanel
                    kos={kos}
                    falls={falls}
                    suicides={suicides}
                    teamKos={teamKos}
                    weaponKos={weaponKos}
                    thrownKos={thrownKos}
                    unarmed={unarmed}
                    gadgets={gadgets}
                />

                <DamagePanel
                    dealt={damageDealt}
                    taken={damageTaken}
                    matchtime={matchtime}
                    weaponDamage={weaponDamage}
                    unarmed={unarmed}
                    gadgets={gadgets}
                    throws={throws}
                />
            </div>
            <div className="@container p-4">
                <StatGrid
                    className="mt-3"
                    stats={[
                        {
                            title: "DPS dealt",
                            value: `${ratio(damageDealt, matchtime).toFixed(1)} dmg/s`,
                        },
                        {
                            title: "DPS taken",
                            value: `${ratio(damageTaken, matchtime).toFixed(1)} dmg/s`,
                        },
                        {
                            title: "Time to KO",
                            value: `${ratio(matchtime, kos).toFixed(1)}s`,
                        },
                        {
                            title: "Time to fall",
                            value: `${ratio(matchtime, falls).toFixed(1)}s`,
                        },
                        {
                            title: "KOs per game",
                            value: perGame(kos, games).toFixed(1),
                        },
                        {
                            title: "Falls per game",
                            value: perGame(falls, games).toFixed(1),
                        },
                        {
                            title: "One suicide every",
                            value: `${ratio(games, suicides).toFixed(1)} games`,
                        },
                        {
                            title: "One team KO every",
                            value: `${ratio(games, teamKos).toFixed(1)} games`,
                        },
                        {
                            title: "Damage dealt per game",
                            value: perGame(damageDealt, games).toFixed(1),
                        },
                        {
                            title: "Damage taken per game",
                            value: perGame(damageTaken, games).toFixed(1),
                        },
                        {
                            title: "Average game length",
                            value: `${perGame(matchtime, games).toFixed(1)}s`,
                        },
                    ]}
                />
            </div>
            <div className="grid gap-4 @2xl:grid-cols-2 @4xl:grid-cols-3">
                <BreakdownPanel
                    title="Unarmed"
                    stats={[
                        {
                            title: "Time unarmed",
                            value: formatTime(unarmed.time_held),
                        },
                        {
                            title: "Time unarmed (%)",
                            value: `${percent(unarmed.time_held, matchtime).toFixed(2)}%`,
                        },
                        { title: "KOs", value: unarmed.kos.toLocaleString() },
                        {
                            title: "KOs per game",
                            value: perGame(unarmed.kos, games).toFixed(2),
                        },
                        {
                            title: "Damage dealt",
                            value: unarmed.damage_dealt.toLocaleString(),
                        },
                        {
                            title: "DPS",
                            value: `${ratio(unarmed.damage_dealt, unarmed.time_held).toFixed(2)} dmg/s`,
                        },
                        {
                            title: "Damage per game",
                            value: perGame(unarmed.damage_dealt, games).toFixed(
                                2,
                            ),
                        },
                    ]}
                />

                <BreakdownPanel
                    title="Weapon throws"
                    // Use derived thrownKos — throws.kos is always 0 (v1 has no counter).
                    stats={koCounts({
                        kos: thrownKos,
                        damage_dealt: throws.damage_dealt,
                    })}
                />
                <BreakdownPanel title="Gadgets" stats={koCounts(gadgets)} />
            </div>
        </div>
    )
}
