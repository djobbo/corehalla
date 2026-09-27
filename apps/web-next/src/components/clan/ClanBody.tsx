import { EntityLink } from "@/components/EntityLink"
import { playerHref } from "@/lib/rankings"
import { clanStatsAtom, useQuery } from "@/effect/atoms"
import { cleanString } from "@crh/common/helpers/cleanString"
import { formatUnixTime } from "@crh/common/helpers/date"

/**
 * A clan's header and roster.
 *
 * The roster is the point of a clan page: a clan exists to be a set of players,
 * so every member links into their profile. That makes a clan something you
 * browse *through* rather than just a summary.
 */

export const ClanIdentity = ({ clanId }: { readonly clanId: number }) => {
    const clan = useQuery(clanStatsAtom(clanId))

    if (!clan) {
        return (
            <p className="text-sm text-textVar1">No clan with id {clanId}.</p>
        )
    }

    return (
        <div className="ch-hero">
            <p className="ch-kicker">Clan</p>
            <h2 className="ch-display mt-1 text-xl sm:text-2xl">
                {cleanString(clan.clan_name)}
            </h2>
            <p className="mt-2 text-xs text-textVar1">
                {Number(clan.clan_xp).toLocaleString()} XP ·{" "}
                {clan.clan.length} member
                {clan.clan.length === 1 ? "" : "s"} · created{" "}
                {formatUnixTime(clan.clan_create_date)}
            </p>
        </div>
    )
}

export const ClanBody = ({ clanId }: { readonly clanId: number }) => {
    const clan = useQuery(clanStatsAtom(clanId))

    if (!clan) return null

    const members = [...clan.clan].sort((a, b) => b.xp - a.xp)

    return (
        <div className="ch-panel overflow-hidden">
            <div className="ch-table-head">
                <span className="flex-1">Member</span>
                <span className="w-24">Rank</span>
                <span className="w-24 text-right">XP</span>
            </div>
            {members.map((member) => (
                <div key={member.brawlhalla_id} className="ch-row text-sm">
                    <EntityLink
                        type="player"
                        id={member.brawlhalla_id}
                        href={playerHref(member.brawlhalla_id)}
                        className="ch-link flex-1 font-semibold"
                    >
                        {/*
                         * v1 intermittently omits a member's name, and the
                         * mapper normalises that to `""` so the type stays
                         * honest. Rendering it would make the row an empty —
                         * but still clickable — link, so the id stands in. The
                         * profile it points at resolves, which is why the row is
                         * worth keeping at all.
                         *
                         * `?? ""` because the key can be *absent* on the wire,
                         * not just empty: a value cached before the mapper
                         * started normalising — which is served until it goes
                         * stale — omits it entirely, and `cleanString(undefined)`
                         * returns the literal text "undefined". Observed, not
                         * imagined: that is what this row rendered.
                         */}
                        {cleanString(member.name ?? "") ||
                            `#${member.brawlhalla_id}`}
                    </EntityLink>
                    <span className="w-24 text-xs text-textVar1">
                        {member.rank}
                    </span>
                    <span className="w-24 text-right font-semibold">
                        {member.xp.toLocaleString()}
                    </span>
                </div>
            ))}
        </div>
    )
}
