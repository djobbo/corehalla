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
        <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold">{cleanString(clan.clan_name)}</h2>
            <p className="text-xs text-textVar1">
                {clan.clan_xp} XP · {clan.clan.length} member
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
        <div className="flex flex-col">
            <div className="flex gap-3 border-b border-bg pb-1 text-xs text-textVar1">
                <span className="flex-1">Member</span>
                <span className="w-24">Rank</span>
                <span className="w-24 text-right">XP</span>
            </div>
            {members.map((member) => (
                <div
                    key={member.brawlhalla_id}
                    className="flex items-center gap-3 border-b border-bg py-1.5 text-sm"
                >
                    <EntityLink
                        type="player"
                        id={member.brawlhalla_id}
                        href={playerHref(member.brawlhalla_id)}
                        className="flex-1 underline"
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
                    <span className="w-24 text-right">
                        {member.xp.toLocaleString()}
                    </span>
                </div>
            ))}
        </div>
    )
}
