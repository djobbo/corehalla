import { Card, CardContent } from "@/components/ui/card"
import { SplitProgress } from "@/components/common/SplitProgress"
import { EntityLink } from "@/components/common/EntityLink"
import { ClanRankIcon } from "./ClanRankIcon"
import { playerHref } from "@/lib/rankings"
import { percent } from "@/lib/stats"
import { cleanString } from "@crh/common/helpers/cleanString"
import { formatUnixTime } from "@crh/common/helpers/date"
import type { GuildMember } from "@crh/api-contract/schemas"
import type { ClanRank } from "@crh/bhapi/constants"

export const MemberCard = ({
    member,
    clanXp,
}: {
    readonly member: GuildMember
    readonly clanXp: number
}) => {
    const share = percent(member.xp, clanXp)

    const points = member.guild_points

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
