import { useAtomValue } from "@effect/atom-react"
import { Link } from "@tanstack/react-router"
import { useMemo } from "react"
import { guildAtom, playerProfileAtom } from "@/effect/atoms"
import { clanHref, playerHref } from "@/lib/rankings"
import { cleanString } from "@crh/common/helpers/cleanString"
import { formatUnixTime } from "@crh/common/helpers/date"

export const EntityPreview = ({
    type,
    id,
}: {
    readonly type: "player" | "clan"
    readonly id: string
}) =>
    type === "player" ? (
        <PlayerPreview playerId={Number(id)} />
    ) : (
        <ClanPreview clanId={Number(id)} />
    )

const PlayerPreview = ({ playerId }: { readonly playerId: number }) => {
    const result = useAtomValue(
        useMemo(() => playerProfileAtom(playerId), [playerId]),
    )

    if (result._tag !== "Success") return null

    const profile = result.value.data
    const name = cleanString(profile.name)
    const ranked = profile.ranked?.["1v1"] ?? null

    const main =
        profile.legends.find((legend) => legend.stats.games > 0) ?? null

    return (
        <Link to={playerHref(profile.slug)} className="flex flex-col gap-1.5">
            <div>
                <p className="ch-kicker">Player</p>
                <p className="ch-display mt-0.5 text-base">{name}</p>
            </div>
            {ranked ? (
                <Row
                    label="1v1"
                    value={`${ranked.rating} · ${
                        ranked.tier ?? "Unranked"
                    } · ${(ranked.region ?? "all").toUpperCase()}`}
                />
            ) : (
                <p className="text-xs text-muted-foreground">
                    No 1v1 ranked record.
                </p>
            )}
            <Row label="Account" value={`Level ${profile.stats.level}`} />

            {main ? (
                <Row
                    label="Main"
                    value={`${main.name} · level ${main.stats.level}`}
                />
            ) : null}

            {profile.clan ? (
                <Row label="Clan" value={cleanString(profile.clan.name)} />
            ) : null}
        </Link>
    )
}

const ClanPreview = ({ clanId }: { readonly clanId: number }) => {
    const result = useAtomValue(useMemo(() => guildAtom(clanId), [clanId]))

    if (result._tag !== "Success") return null

    const guild = result.value.data
    const members = [...guild.members].sort((a, b) => b.xp - a.xp)

    return (
        <Link to={clanHref(guild.slug)} className="flex flex-col gap-1.5">
            <div>
                <p className="ch-kicker">Clan</p>
                <p className="ch-display mt-0.5 text-base">
                    {cleanString(guild.name)}
                </p>
            </div>
            <Row label="Clan XP" value={guild.xp.toLocaleString()} />
            <Row
                label="Members"
                value={`${guild.members.length} · created ${formatUnixTime(
                    guild.created_at,
                )}`}
            />

            {members.length > 0 ? (
                <div className="flex flex-col gap-0.5 border-t border-border pt-1.5">
                    <span className="ch-kicker">Top members</span>
                    {members.slice(0, 3).map((member) => (
                        <span key={member.id} className="text-xs">
                            {cleanString(member.name) || `#${member.id}`} ·{" "}
                            {member.xp.toLocaleString()} XP
                        </span>
                    ))}
                </div>
            ) : null}
        </Link>
    )
}

const Row = ({
    label,
    value,
}: {
    readonly label: string
    readonly value: string
}) => (
    <div className="flex gap-2">
        <span className="w-16 shrink-0 text-[0.6rem] font-bold tracking-[0.12em] text-muted-foreground uppercase">
            {label}
        </span>
        <span className="flex-1 text-xs">{value}</span>
    </div>
)
