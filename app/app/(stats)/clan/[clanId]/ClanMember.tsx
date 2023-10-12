import { AppLink } from "ui/base/AppLink"
import { Card } from "ui/base/Card"
import { FaCrown } from "react-icons/fa"
import { HiStar, HiUser, HiUserAdd } from "react-icons/hi"
import { type MiscStat, MiscStatGroup } from "@/components/stats/MiscStatGroup"
import { cleanString } from "common/helpers/cleanString"
import { formatUnixTime } from "common/helpers/date"
import type { Clan } from "bhapi/types"
import type { ClanRank } from "bhapi/constants"
import type { IconType } from "react-icons"

type ClanMemberProps = {
    member: Clan["clan"][number]
    clan: Clan
}

const memberIcons: Record<ClanRank, IconType> = {
    Leader: FaCrown,
    Officer: HiStar,
    Member: HiUser,
    Recruit: HiUserAdd,
} as const

export const ClanMember = ({ member, clan }: ClanMemberProps) => {
    const memberStats: MiscStat[] = [
        {
            name: "Joined on",
            value: formatUnixTime(member.join_date),
            desc: `Date when ${cleanString(member.name)} joined the clan`,
        },
        {
            name: "XP",
            value: `${member.xp} (${(
                (member.xp / parseInt(clan.clan_xp)) *
                100
            ).toFixed(2)}
                    %)`,
            desc: `XP earned ${cleanString(
                member.name,
            )} the member since joining the clan`,
        },
    ]

    const Icon = memberIcons[member.rank]

    return (
        <AppLink
            href={`/stats/player/${member.brawlhalla_id}`}
            key={member.brawlhalla_id}
        >
            <Card
                key={member.brawlhalla_id}
                title={
                    <span className="flex items-center gap-1">
                        <Icon size={12} />
                        {cleanString(member.name)}
                        <span className="text-xs text-textVar1">
                            ({member.rank})
                        </span>
                    </span>
                }
                className="hover:bg-bgVar2"
            >
                <MiscStatGroup
                    className="mt-4 justify-items-center text-center"
                    fit="fit"
                    stats={memberStats}
                />
            </Card>
        </AppLink>
    )
}
