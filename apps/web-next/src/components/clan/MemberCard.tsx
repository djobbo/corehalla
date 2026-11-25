import { Card, CardContent } from "@/components/ui/card"
import { SplitProgress } from "@/components/common/SplitProgress"
import { EntityLink } from "@/components/common/EntityLink"
import { ClanRankIcon } from "./ClanRankIcon"
import { regionFlagSrc } from "@/lib/assets"
import { playerHref, tierColor } from "@/lib/rankings"
import { percent } from "@/lib/stats"
import { cleanString } from "@crh/common/helpers/cleanString"
import { formatUnixTime } from "@crh/common/helpers/date"
import type { GuildMember } from "@crh/api-contract/schemas"
import type { ClanRank } from "@crh/bhapi/constants"
import type { CSSProperties } from "react"

export const MemberCard = ({
    member,
    clanXp,
}: {
    readonly member: GuildMember
    readonly clanXp: number
}) => {
    const share = percent(member.xp, clanXp)

    const points = member.guild_points
    const ranked = member.ranked

    return (
        <Card className="overflow-visible py-0">
            <CardContent className="p-4">
                <div className="ch-nameplate ch-nameplate-wide">
                    <ClanRankIcon rank={member.rank as ClanRank} />
                    <div className="ch-nameplate-names">
                        <EntityLink
                            type="player"
                            id={member.id}
                            href={playerHref(member.slug)}
                            className="transition-colors hover:text-ring"
                        >
                            {cleanString(member.name) || `#${member.id}`}
                        </EntityLink>
                    </div>
                </div>
                {ranked === null ? (
                    <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-bold text-muted-foreground">
                        <span aria-hidden="true">—</span>
                        <span className="sr-only">
                            No 1v1 rating in Corehalla&apos;s index
                        </span>
                        <span
                            className="text-xs font-normal"
                            aria-hidden="true"
                        >
                            1v1
                        </span>
                    </p>
                ) : (
                    <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span
                            className="ch-tier shrink-0"
                            style={
                                {
                                    "--ch-tier": tierColor(
                                        ranked.tier ?? "Valhallan",
                                    ),
                                } as CSSProperties
                            }
                        >
                            {ranked.tier ?? "Valhallan"}
                        </span>
                        <span
                            className="text-sm font-bold"
                            title={`Peak ${ranked.peak_rating.toLocaleString()} rating`}
                        >
                            {ranked.rating.toLocaleString()}
                            <span className="ml-1 text-xs font-normal text-muted-foreground">
                                1v1
                            </span>
                        </span>
                        {ranked.region === null ? null : (
                            <img
                                src={regionFlagSrc(ranked.region)}
                                alt={`${ranked.region.toUpperCase()} region`}
                                title={`${ranked.region.toUpperCase()} region`}
                                className="h-3.5 w-5 shrink-0 rounded-sm object-contain"
                            />
                        )}
                    </p>
                )}
                <p className="ch-display mt-2 text-2xl">
                    {member.xp.toLocaleString()}
                    <span className="ml-2 text-xs font-normal tracking-normal text-muted-foreground">
                        / {clanXp.toLocaleString()} XP
                    </span>
                </p>
                <SplitProgress
                    className="mt-2"
                    total={clanXp}
                    parts={[{ key: "xp", value: member.xp, intent: "blue" }]}
                />
                <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm font-bold">
                    <span className="whitespace-nowrap">
                        {share.toFixed(2)}%{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                            of clan XP
                        </span>
                    </span>
                    {points === undefined ? null : (
                        <span className="whitespace-nowrap">
                            {points.toLocaleString()}{" "}
                            <span className="text-xs font-normal text-muted-foreground">
                                guild points
                            </span>
                        </span>
                    )}
                </div>
                <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                    joined {formatUnixTime(member.joined_at)}
                </p>
            </CardContent>
        </Card>
    )
}
