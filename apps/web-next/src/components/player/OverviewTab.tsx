import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Breakdown } from "@/components/Breakdown"
import { SplitProgress } from "@/components/SplitProgress"
import { StatGrid } from "@/components/StatGrid"
import { RankedCard } from "./RankedCard"
import { usePlayerDerived } from "./usePlayerDerived"
import { EntityLink } from "@/components/EntityLink"
import { cn } from "@/lib/cn"
import { clanHref, isPairedTeam } from "@/lib/rankings"
import { percent, perGame, ratio } from "@/lib/stats"
import { rankedRegions } from "@crh/bhapi/constants"
import { cleanString } from "@crh/common/helpers/cleanString"
import { formatTime } from "@crh/common/helpers/date"
import type { Stat } from "@/components/StatGrid"
import type { BreakdownEntry } from "@/components/Breakdown"
import type { PlayerDerived } from "./usePlayerDerived"
import type {
    Player3v3Ranked,
    PlayerRanked,
    PlayerStats,
} from "@crh/bhapi/types"

/**
 * The overview: what this account is, in card-grid form.
 *
 * The structure follows the newer `kubi` client rather than the legacy app's
 * stack of collapsible sections. Ranked records lead as a row of comparable
 * cards; volume (games, KOs, damage) follows; the long tail of derived averages
 * collapses into one wide stat grid; and the unarmed/throw/gadget breakdowns
 * close it out.
 *
 * Nothing is collapsed by default. The legacy page hid most of this behind
 * disclosures, which meant the answer to "how does this player actually play"
 * was always one click away on a page whose entire job is to answer it.
 */

/** One row of the `2v2` list — a pairing, or a solo record. */
type Team = PlayerRanked["2v2"][number]

const summed = (value: number): string => value.toLocaleString()

// --- ranked -----------------------------------------------------------------

/**
 * The player's 1v1 ranked record, or nothing.
 *
 * `ranked` being present says only that the player has *some* ranked data — a
 * 2v2 season, a legend rating — so the card is gated on games actually played in
 * this bracket rather than on the payload existing. A player who has never
 * queued 1v1 gets no card, not an empty one.
 */
const Ranked1v1Panel = ({
    ranked,
}: {
    readonly ranked: PlayerRanked | null
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

// --- solo queue ---------------------------------------------------------------

/**
 * The player's solo-queue 2v2 record, or nothing.
 *
 * Queuing 2v2 alone lands in the same `2v2` list as a real team, minus the
 * partner. It is a record in its own right rather than a team, so it gets its
 * own card here instead of a team card on the 2v2 tab — and the card returns
 * `null` rather than an empty state, because a player who has never solo queued
 * should not be told about it.
 */
const SoloQueuePanel = ({ solo }: { readonly solo: Team }) => {
    const region = rankedRegions[solo.region - 1] ?? null

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

// --- 3v3 ----------------------------------------------------------------------

/**
 * The player's 3v3 ranked record, or nothing.
 *
 * 3v3 is a solo queue — v1's ladder carries one player per row because the
 * teams are assembled per match — so this is a record in its own right rather
 * than a team, exactly like the solo-queue 2v2 card beside it.
 *
 * The record itself comes from its own endpoint rather than from `ranked`,
 * because v0 has no 3v3 mode; see `player3v3RankedAtom`. Gated on games played
 * for the same reason as the other two: a payload with no games behind it is
 * not a record, and a player who has never queued 3v3 should not be shown a
 * zero-rated card for it.
 */
const Ranked3v3Panel = ({
    ranked,
}: {
    readonly ranked: Player3v3Ranked | null
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

// --- clan -------------------------------------------------------------------

const ClanPanel = ({ stats }: { readonly stats: PlayerStats }) => {
    const clan = stats.clan

    if (!clan) return null

    const clanXp = Number(clan.clan_xp)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Clan</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap items-baseline gap-2">
                    <EntityLink
                        type="clan"
                        id={clan.clan_id}
                        href={clanHref(clan.clan_id)}
                        className="ch-display text-xl transition-colors hover:text-ring"
                    >
                        {cleanString(clan.clan_name)}
                    </EntityLink>
                    <span className="text-xs text-muted-foreground">
                        #{clan.clan_id}
                    </span>
                </div>
                <Card className="mt-3 bg-background">
                    <CardContent>
                        <StatGrid
                            stats={[
                                { title: "Clan XP", value: summed(clanXp) },
                                {
                                    title: "Contribution",
                                    value: `${percent(clan.personal_xp, clanXp).toFixed(2)}%`,
                                    hint: `Share of the clan's XP earned by this player`,
                                },
                            ]}
                        />
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    )
}

// --- volume -----------------------------------------------------------------

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
                {summed(games)}
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
                    {summed(wins)}W{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                        ({percent(wins, games).toFixed(2)}%)
                    </span>
                </span>
                <span>
                    {summed(games - wins)}L{" "}
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
    teamkos,
    weaponKos,
    thrownKos,
    weaponless,
}: {
    readonly kos: number
    readonly falls: number
    readonly suicides: number
    readonly teamkos: number
    readonly weaponKos: number
    readonly thrownKos: number
    readonly weaponless: PlayerDerived["weaponless"]
}) => {
    const { unarmed, gadgets } = weaponless

    /*
     * A fall is only ever self-inflicted or caused by an opponent, so `falls`
     * has exactly two parts — `teamkos` is absent here because a team KO counts
     * toward the KO of whoever landed it, never toward the fall of whoever took
     * it.
     */
    const koed = Math.max(0, falls - suicides)

    /*
     * Both bars are drawn against the larger of the two totals, so their lengths
     * are comparable at a glance — a KOs bar that filled its own width would say
     * nothing about how it relates to falls.
     *
     * The KOs parts do add up to `kos`, because thrown-item KOs are derived as
     * the remainder rather than read from a field v1 never sends; so on this bar
     * the hollow slot appears only when `falls` is the larger total.
     */
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
                                value: thrownKos,
                                intent: "yellow",
                            },
                            {
                                key: "teamkos",
                                label: "team KOs",
                                value: teamkos,
                                intent: "pink",
                            },
                        ]}
                    />

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
    weaponless,
}: {
    readonly dealt: number
    readonly taken: number
    readonly matchtime: number
    readonly weaponDamage: number
    readonly weaponless: PlayerDerived["weaponless"]
}) => {
    const { unarmed, gadgets, throws } = weaponless

    /*
     * Both bars share one scale, so "dealt" and "taken" can be compared by eye
     * rather than each filling its own width.
     */
    const sharedMax = Math.max(dealt, taken)

    /*
     * Unlike the KO breakdown, every one of these parts is read straight from a
     * counter v1 actually sends — thrown-item *damage* exists even though
     * thrown-item *KOs* do not. They still do not quite sum to `damage_dealt`,
     * because self-inflicted damage has no counter of its own, and that
     * shortfall is what the hollow slot shows.
     */
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
            value: unarmed.damageDealt,
            intent: "cyan",
        },
        {
            key: "gadgets",
            label: "using gadgets",
            value: gadgets.damageDealt,
            intent: "green",
        },
        {
            key: "throws",
            label: "using throws",
            value: throws.damageDealt,
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

                    {/*
                     * Damage taken has no source in either API version — the
                     * payload carries a total and nothing else — so it is one piece
                     * against the shared scale, and needs no key.
                     */}
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

// --- weaponless breakdown ----------------------------------------------------

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

// --- page -------------------------------------------------------------------

export const OverviewTab = ({ playerId }: { readonly playerId: number }) => {
    const player = usePlayerDerived(playerId)

    if (!player) return null

    const {
        stats,
        ranked,
        ranked3v3,
        totals,
        weaponless,
        weaponKos,
        thrownKos,
        weaponDamage,
    } = player
    const { unarmed, gadgets, throws } = weaponless

    const { games } = stats
    const {
        matchtime,
        kos,
        falls,
        suicides,
        teamkos,
        damagedealt,
        damagetaken,
    } = totals

    /*
     * A ranked record only earns a card if it has games behind it. `ranked`
     * being present means the player has *some* ranked data, which is not the
     * same as having played this bracket.
     */
    const has1v1 = ranked !== null && ranked.games > 0
    const soloRecord = (ranked?.["2v2"] ?? []).find(
        (team) => !isPairedTeam(team),
    )
    const has3v3 = ranked3v3 !== null && ranked3v3.games > 0

    /*
     * One, two or three cards. The column count follows the count of cards
     * actually rendered rather than the count of brackets that exist, so a
     * lone card keeps its natural width instead of stretching across the row,
     * and three cards do not leave an orphan alone on a second row once there
     * is width for all three.
     */
    const rankedCardCount = [has1v1, soloRecord !== undefined, has3v3].filter(
        Boolean,
    ).length

    const koCounts = (weapon: { kos: number; damageDealt: number }): Stat[] => [
        { title: "KOs", value: summed(weapon.kos) },
        {
            title: "One KO every",
            value: `${ratio(games, weapon.kos).toFixed(1)} games`,
        },
        { title: "Damage dealt", value: summed(weapon.damageDealt) },
        {
            title: "Avg. damage per game",
            value: perGame(weapon.damageDealt, games).toFixed(2),
        },
    ]

    return (
        <div className="flex flex-col gap-4">
            {/*
             * The ranked records. Any of the three can be missing — plenty of
             * players never queue 1v1, plenty never queue solo, and 3v3 is the
             * least-played bracket of all — and a lone card spanning half a row
             * with nothing beside it reads as something failed to load.
             */}
            {rankedCardCount > 0 ? (
                <div
                    className={cn(
                        "grid gap-4",
                        rankedCardCount > 1 && "md:grid-cols-2",
                        rankedCardCount > 2 && "lg:grid-cols-3",
                    )}
                >
                    <Ranked1v1Panel ranked={ranked} />
                    {soloRecord ? <SoloQueuePanel solo={soloRecord} /> : null}
                    <Ranked3v3Panel ranked={ranked3v3} />
                </div>
            ) : null}

            <ClanPanel stats={stats} />

            {/*
             * Games runs full width on its own; the two stacked-bar breakdowns
             * pair up once there is room for both.
             */}
            <GamesPanel games={games} wins={stats.wins} />

            <div className="grid gap-4 lg:grid-cols-2">
                <KosFallsPanel
                    kos={kos}
                    falls={falls}
                    suicides={suicides}
                    teamkos={teamkos}
                    weaponKos={weaponKos}
                    thrownKos={thrownKos}
                    weaponless={weaponless}
                />

                <DamagePanel
                    dealt={damagedealt}
                    taken={damagetaken}
                    matchtime={matchtime}
                    weaponDamage={weaponDamage}
                    weaponless={weaponless}
                />
            </div>

            {/*
             * Transparent on purpose: these are derived averages, not a section
             * of their own, so they sit straight on the page rather than in one
             * more card. The container is kept for its padding and its
             * container-query context — without the latter the grid would fall
             * back to a single column.
             */}
            <div className="@container p-4">
                <StatGrid
                    className="mt-3"
                    stats={[
                        {
                            title: "DPS dealt",
                            value: `${ratio(damagedealt, matchtime).toFixed(1)} dmg/s`,
                        },
                        {
                            title: "DPS taken",
                            value: `${ratio(damagetaken, matchtime).toFixed(1)} dmg/s`,
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
                            value: `${ratio(games, teamkos).toFixed(1)} games`,
                        },
                        {
                            title: "Damage dealt per game",
                            value: perGame(damagedealt, games).toFixed(1),
                        },
                        {
                            title: "Damage taken per game",
                            value: perGame(damagetaken, games).toFixed(1),
                        },
                        {
                            title: "Average game length",
                            value: `${perGame(matchtime, games).toFixed(1)}s`,
                        },
                    ]}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <BreakdownPanel
                    title="Unarmed"
                    stats={[
                        {
                            title: "Time unarmed",
                            value: formatTime(unarmed.matchtime),
                        },
                        {
                            title: "Time unarmed (%)",
                            value: `${percent(unarmed.matchtime, matchtime).toFixed(2)}%`,
                        },
                        { title: "KOs", value: summed(unarmed.kos) },
                        {
                            title: "KOs per game",
                            value: perGame(unarmed.kos, games).toFixed(2),
                        },
                        {
                            title: "Damage dealt",
                            value: summed(unarmed.damageDealt),
                        },
                        {
                            title: "DPS",
                            value: `${ratio(unarmed.damageDealt, unarmed.matchtime).toFixed(2)} dmg/s`,
                        },
                        {
                            title: "Damage per game",
                            value: perGame(unarmed.damageDealt, games).toFixed(
                                2,
                            ),
                        },
                    ]}
                />
                {/*
                 * KOs come from the derived figure, not `weaponless.throws.kos`:
                 * the v1 payload has no thrown-item KO counter, so reading it
                 * here would print a hard 0 next to perfectly good damage.
                 */}
                <BreakdownPanel
                    title="Weapon throws"
                    stats={koCounts({
                        kos: thrownKos,
                        damageDealt: throws.damageDealt,
                    })}
                />
                <BreakdownPanel title="Gadgets" stats={koCounts(gadgets)} />
            </div>
        </div>
    )
}
