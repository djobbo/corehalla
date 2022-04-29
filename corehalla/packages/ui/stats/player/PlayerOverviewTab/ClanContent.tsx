import { AppLink } from "../../../base/AppLink"
import { MiscStatGroup } from "../../MiscStatGroup"
import { SectionTitle } from "../../../layout/SectionTitle"
import { cleanString } from "common/helpers/cleanString"
import { cn } from "common/helpers/classnames"
import type { PlayerStats } from "bhapi/types"

type PlayerOverviewClanContentProps = {
    clan: Required<PlayerStats>["clan"]
}

export const PlayerOverviewClanContent = ({
    clan,
}: PlayerOverviewClanContentProps) => {
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
                    },
                    {
                        name: "Clan XP Contribution",
                        value: `${(
                            (clan.personal_xp / parseInt(clan.clan_xp)) *
                            100
                        ).toFixed(2)}%`,
                    },
                ]}
            />
        </>
    )
}
