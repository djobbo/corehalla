import { MiscStatGroup } from "ui/stats/MiscStatGroup"
import { SectionTitle } from "ui/layout/SectionTitle"
import { cn } from "common/helpers/classnames"
import { text } from "ui/theme"
import Link from "next/link"
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
                <Link href={`/stats/clan/${clan.clan_id}`}>
                    <a
                        className={cn(
                            "inline-block font-bold text-3xl mt-2 hover:underline",
                        )}
                    >
                        {clan.clan_name}{" "}
                    </a>
                </Link>
                <span
                    className={cn(
                        "inline-block text-xs font-bold ml-2",
                        text("blue9"),
                    )}
                >
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
