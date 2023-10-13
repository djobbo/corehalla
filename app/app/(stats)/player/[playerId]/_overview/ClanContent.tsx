import { AppLink } from "ui/base/AppLink"
import { ClanIcon } from "ui/icons"
import { CollapsibleSection } from "@/components/layout/CollapsibleSection"
import { MiscStatGroup } from "@/components/stats/MiscStatGroup"
import { cleanString } from "common/helpers/cleanString"
import { cn } from "@/lib/utils"
import { usePlayerStats } from "../PlayerStatsProvider"

export const ClanContent = () => {
    const {
        stats: { name: playerName, clan },
    } = usePlayerStats()

    if (!clan) return null

    return (
        <CollapsibleSection
            trigger={
                <>
                    <ClanIcon size={20} className="fill-accentVar1" />
                    Clan
                </>
            }
        >
            <p>
                <AppLink
                    href={`/clan/${clan.clan_id}`}
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
                        name: "Contribution",
                        value: `${(
                            (clan.personal_xp / parseInt(clan.clan_xp)) *
                            100
                        ).toFixed(2)}%`,
                        desc: `Percentage of the clan XP earned by ${cleanString(
                            playerName,
                        )}`,
                    },
                ]}
            />
        </CollapsibleSection>
    )
}
