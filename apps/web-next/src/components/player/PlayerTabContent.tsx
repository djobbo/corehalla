import { EntityLink } from "@/components/EntityLink"
import { playerHref } from "@/lib/rankings"
import { playerRankedAtom, playerStatsAtom, useQuery } from "@/effect/atoms"
import {
    getFullLegends,
    getFullWeapons,
    getLegendsAccumulativeData,
    getWeaponsAccumulativeData,
} from "@crh/bhapi/legends"
import { cleanString } from "@crh/common/helpers/cleanString"
import { formatTime } from "@crh/common/helpers/date"

/**
 * A player profile's tab content, in one place.
 *
 * Each tab is its own route, so what a tab *contains* is separated from the
 * routing that selects it. Anything that renders a profile renders this, which
 * keeps a single definition of what "the legends tab" means.
 *
 * The caller owns the header and the tab strip.
 */

export type PlayerTab = "overview" | "2v2" | "legends" | "weapons"

export const playerTabs: readonly { tab: PlayerTab; label: string }[] = [
    { tab: "overview", label: "Overview" },
    { tab: "2v2", label: "2v2" },
    { tab: "legends", label: "Legends" },
    { tab: "weapons", label: "Weapons" },
]

export const PlayerTabContent = ({
    playerId,
    tab,
}: {
    readonly playerId: number
    readonly tab: PlayerTab
}) => {
    if (tab === "2v2") return <Teams playerId={playerId} />
    if (tab === "legends") return <Legends playerId={playerId} />
    if (tab === "weapons") return <Weapons playerId={playerId} />

    return <Overview playerId={playerId} />
}

// --- overview --------------------------------------------------------------

const Overview = ({ playerId }: { readonly playerId: number }) => {
    const stats = useQuery(playerStatsAtom(playerId))
    const ranked = useQuery(playerRankedAtom(playerId))

    if (!stats) return null

    const fullLegends = getFullLegends(stats.legends, ranked?.legends)
    const totals = getLegendsAccumulativeData(fullLegends)
    const played = fullLegends
        .filter((legend) => (legend.stats?.games ?? 0) > 0)
        .sort((a, b) => (b.stats?.xp ?? 0) - (a.stats?.xp ?? 0))

    return (
        <div className="flex flex-col gap-4">
            {ranked ? (
                <section>
                    <h2 className="text-sm font-semibold">1v1 ranked</h2>
                    <dl className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
                        <Stat label="Rating" value={ranked.rating} />
                        <Stat label="Peak" value={ranked.peak_rating} />
                        <Stat label="Tier" value={ranked.tier ?? "—"} />
                        <Stat
                            label="Global rank"
                            value={ranked.global_rank || "—"}
                        />
                        <Stat label="Wins" value={ranked.wins} />
                        <Stat label="Games" value={ranked.games} />
                        <Stat
                            label="Region"
                            value={ranked.region.toUpperCase()}
                        />
                    </dl>
                </section>
            ) : (
                <p className="text-sm text-textVar1">
                    No 1v1 ranked record for this player.
                </p>
            )}

            <section>
                <h2 className="text-sm font-semibold">Account</h2>
                <dl className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
                    <Stat label="Account level" value={stats.level} />
                    <Stat
                        label="Account XP"
                        value={stats.xp.toLocaleString()}
                    />
                    <Stat label="Games" value={stats.games.toLocaleString()} />
                    <Stat label="Wins" value={stats.wins.toLocaleString()} />
                    <Stat
                        label="Time in game"
                        value={formatTime(totals.matchtime)}
                    />
                    <Stat
                        label="Knockouts"
                        value={totals.kos.toLocaleString()}
                    />
                    <Stat label="Falls" value={totals.falls.toLocaleString()} />
                    <Stat
                        label="Legends played"
                        value={String(played.length)}
                    />
                </dl>
            </section>

            {played.length > 0 && (
                <section>
                    <h2 className="text-sm font-semibold">
                        Most played legends
                    </h2>
                    <ul className="mt-1 text-sm">
                        {played.slice(0, 5).map((legend) => (
                            <li key={legend.legend_id} className="py-0.5">
                                {legend.bio_name} — level{" "}
                                {legend.stats?.level ?? 0},{" "}
                                {(legend.stats?.games ?? 0).toLocaleString()}{" "}
                                games
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    )
}

const Stat = ({
    label,
    value,
}: {
    readonly label: string
    readonly value: string | number
}) => (
    <div>
        <dt className="text-xs text-textVar1">{label}</dt>
        <dd>{value}</dd>
    </div>
)

// --- 2v2 -------------------------------------------------------------------

const Teams = ({ playerId }: { readonly playerId: number }) => {
    const ranked = useQuery(playerRankedAtom(playerId))
    const teams = ranked?.["2v2"] ?? []

    if (teams.length === 0) {
        return (
            <p className="text-sm text-textVar1">
                No 2v2 ranked record for this player.
            </p>
        )
    }

    return (
        <ul className="flex flex-col">
            {teams.map((team) => {
                const [first = "", second = ""] = team.teamname.split("+")

                return (
                    <li
                        key={`${team.brawlhalla_id_one}-${team.brawlhalla_id_two}`}
                        className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-bg py-2 text-sm"
                    >
                        <span className="flex flex-1 gap-2">
                            <EntityLink
                                type="player"
                                id={team.brawlhalla_id_one}
                                href={playerHref(team.brawlhalla_id_one)}
                                className="underline"
                            >
                                {first}
                            </EntityLink>
                            <EntityLink
                                type="player"
                                id={team.brawlhalla_id_two}
                                href={playerHref(team.brawlhalla_id_two)}
                                className="underline"
                            >
                                {second}
                            </EntityLink>
                        </span>
                        <span>{team.rating}</span>
                        <span className="w-24 text-xs text-textVar1">
                            {team.tier}
                        </span>
                        <span className="w-20 text-xs text-textVar1">
                            {team.wins}W / {team.games}G
                        </span>
                    </li>
                )
            })}
        </ul>
    )
}

// --- legends ---------------------------------------------------------------

const Legends = ({ playerId }: { readonly playerId: number }) => {
    const stats = useQuery(playerStatsAtom(playerId))
    const ranked = useQuery(playerRankedAtom(playerId))

    if (!stats) return null

    const legends = getFullLegends(stats.legends, ranked?.legends)
        .filter((legend) => (legend.stats?.games ?? 0) > 0)
        .sort((a, b) => (b.stats?.games ?? 0) - (a.stats?.games ?? 0))

    if (legends.length === 0) {
        return (
            <p className="text-sm text-textVar1">No legend games recorded.</p>
        )
    }

    return (
        <div className="flex flex-col">
            <div className="flex gap-3 border-b border-bg pb-1 text-xs text-textVar1">
                <span className="flex-1">Legend</span>
                <span className="w-16 text-right">Level</span>
                <span className="w-20 text-right">Games</span>
                <span className="w-20 text-right">Wins</span>
                <span className="w-24 text-right">Rated</span>
            </div>
            {legends.map((legend) => (
                <div
                    key={legend.legend_id}
                    className="flex gap-3 border-b border-bg py-1.5 text-sm"
                >
                    <span className="flex-1">{legend.bio_name}</span>
                    <span className="w-16 text-right text-textVar1">
                        {legend.stats?.level ?? 0}
                    </span>
                    <span className="w-20 text-right">
                        {(legend.stats?.games ?? 0).toLocaleString()}
                    </span>
                    <span className="w-20 text-right">
                        {(legend.stats?.wins ?? 0).toLocaleString()}
                    </span>
                    <span className="w-24 text-right text-textVar1">
                        {legend.ranked
                            ? `${legend.ranked.rating} ${legend.ranked.tier ?? ""}`
                            : "—"}
                    </span>
                </div>
            ))}
        </div>
    )
}

// --- weapons ---------------------------------------------------------------

const Weapons = ({ playerId }: { readonly playerId: number }) => {
    const stats = useQuery(playerStatsAtom(playerId))
    const ranked = useQuery(playerRankedAtom(playerId))

    if (!stats) return null

    const weapons = getWeaponsAccumulativeData(
        getFullWeapons(getFullLegends(stats.legends, ranked?.legends)),
    )
        .filter((weapon) => weapon.games > 0)
        .sort((a, b) => b.matchtime - a.matchtime)

    if (weapons.length === 0) {
        return (
            <p className="text-sm text-textVar1">No weapon usage recorded.</p>
        )
    }

    return (
        <div className="flex flex-col">
            <div className="flex gap-3 border-b border-bg pb-1 text-xs text-textVar1">
                <span className="flex-1">Weapon</span>
                <span className="w-20 text-right">Games</span>
                <span className="w-20 text-right">Wins</span>
                <span className="w-24 text-right">Time held</span>
                <span className="w-20 text-right">KOs</span>
            </div>
            {weapons.map((weapon) => (
                <div
                    key={weapon.weapon}
                    className="flex gap-3 border-b border-bg py-1.5 text-sm"
                >
                    <span className="flex-1">{weapon.weapon}</span>
                    <span className="w-20 text-right">
                        {weapon.games.toLocaleString()}
                    </span>
                    <span className="w-20 text-right">
                        {weapon.wins.toLocaleString()}
                    </span>
                    <span className="w-24 text-right text-textVar1">
                        {formatTime(weapon.matchtime)}
                    </span>
                    <span className="w-20 text-right">
                        {weapon.kos.toLocaleString()}
                    </span>
                </div>
            ))}
        </div>
    )
}

/** The player header. */
export const PlayerIdentity = ({ playerId }: { readonly playerId: number }) => {
    const stats = useQuery(playerStatsAtom(playerId))
    const ranked = useQuery(playerRankedAtom(playerId))

    if (!stats) {
        return (
            <p className="text-sm text-textVar1">
                No player with id {playerId}.
            </p>
        )
    }

    const clan = stats.clan

    return (
        <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold">{cleanString(stats.name)}</h2>
            <p className="text-xs text-textVar1">
                Level {stats.level} · {stats.xp.toLocaleString()} XP
                {ranked?.tier ? ` · ${ranked.tier}` : ""}
                {ranked ? ` · ${ranked.rating} rating` : ""}
                {ranked?.region ? ` · ${ranked.region.toUpperCase()}` : ""}
            </p>
            {clan ? (
                <p className="text-xs text-textVar1">
                    Clan:{" "}
                    <EntityLink
                        type="clan"
                        id={clan.clan_id}
                        href={`/stats/clan/${clan.clan_id}`}
                        className="underline"
                    >
                        {cleanString(clan.clan_name)}
                    </EntityLink>
                </p>
            ) : null}
        </div>
    )
}

