import { AppLink } from "ui/base/AppLink"
import { MiscStatGroup } from "../../MiscStatGroup"
import { SectionTitle } from "../../../layout/SectionTitle"
import { cleanString } from "common/helpers/cleanString"
import { cn } from "common/helpers/classnames"
import type { PlayerStats } from "bhapi/types"

type PlayerOverviewClanContentProps = {
    playerStats: PlayerStats
}

export const PlayerOverviewClanContent = ({
    playerStats,
}: PlayerOverviewClanContentProps) => {
    const { name: playerName, clan } = playerStats

    if (!clan) return null

    return (
        <>
            <SectionTitle hasBorder>Clan</SectionTitle>
            <p>
                <AppLink
                    href={`/stats/clan/${clan.clan_id}`}
                    className={cn(
                        "inline-block font-bold text-3xl mt-2 hover:underline",
                    )}
                >
                    {cleanString(clan.clan_name)}
                </AppLink>
                <span className="inline-block text-xs font-bold ml-2 text-textVar1">
                    #{clan.clan_id}
                </span>
            </p>
            <MiscStatGroup
                className="mt-4"
                stats={[
                    {
                        name: "Clan XP",
                        value: clan.clan_xp,
                        desc: "XP earned by the clan members since creation",
                    },
                    {
                        name: "Clan XP Contribution",
                        value: `${(
                            (clan.personal_xp / parseInt(clan.clan_xp)) *
                            100
                        ).toFixed(2)}%`,
                        desc: `Percentage of the clan XP earned by the ${cleanString(
                            playerName,
                        )}`,
                    },
                ]}
            />
        </>
    )
}
