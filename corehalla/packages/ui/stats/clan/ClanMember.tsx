import { Card } from "ui/base/Card"
import { MiscStatGroup } from "../MiscStatGroup"
import { border } from "../../theme"
import { formatUnixTime } from "common/helpers/date"
import Link from "next/link"
import type { Clan } from "bhapi/types"
import type { MiscStat } from "../MiscStatGroup"

type ClanMemberProps = {
    member: Clan["clan"][number]
    clan: Clan
}

export const ClanMember = ({ member, clan }: ClanMemberProps) => {
    const memberStats: MiscStat[] = [
        {
            name: "Joined on",
            value: formatUnixTime(member.join_date),
        },
        {
            name: "XP",
            value: `${member.xp} (
                    ${((member.xp / parseInt(clan.clan_xp)) * 100).toFixed(2)}
                    %)`,
        },
    ]

    return (
        <Link
            href={`/stats/player/${member.brawlhalla_id}`}
            key={member.brawlhalla_id}
        >
            <a>
                <Card
                    key={member.brawlhalla_id}
                    title={`${member.name} (${member.rank})`}
                    className={border("blue6", "&:hover")}
                >
                    <MiscStatGroup
                        className="mt-4 justify-items-center text-center"
                        fit="fit"
                        stats={memberStats}
                    />
                </Card>
            </a>
        </Link>
    )
}
