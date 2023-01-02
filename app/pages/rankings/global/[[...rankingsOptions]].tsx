import { AppLink } from "@ch/ui/base/AppLink"
import { GLOBAL_PLAYER_RANKINGS_PER_PAGE } from "@util/constants"
import { Select } from "@ch/ui/base/Select"
import { cleanString } from "@ch/common/helpers/cleanString"
import { cn } from "@ch/common/helpers/classnames"
import { trpc } from "@util/trpc"
import { useState } from "react"
import type { NextPage } from "next"
import type { SortablePlayerProp } from "@ch/db-utils/mutations/updateDBPlayerData"

const Page: NextPage = () => {
    const page = "1"

    const [sortBy, setSortBy] = useState<SortablePlayerProp>("xp")
    const { data: players } = trpc.getGlobalPlayerRankings.useQuery({
        page,
        sortBy,
    })

    return (
        <>
            <Select<SortablePlayerProp>
                className="flex-1"
                onChange={setSortBy}
                value={sortBy}
                options={[
                    {
                        label: "Account XP",
                        value: "xp",
                    },
                    {
                        label: "Games",
                        value: "games",
                    },
                    {
                        label: "Wins",
                        value: "wins",
                    },
                    {
                        label: "Ranked Games",
                        value: "rankedGames",
                    },
                    {
                        label: "Ranked Wins",
                        value: "rankedWins",
                    },
                    {
                        label: "Damage Dealt",
                        value: "damageDealt",
                    },
                    {
                        label: "Damage Taken",
                        value: "damageTaken",
                    },
                    {
                        label: "KOs",
                        value: "kos",
                    },
                    {
                        label: "Falls",
                        value: "falls",
                    },
                    {
                        label: "Suicides",
                        value: "suicides",
                    },
                    {
                        label: "Team KOs",
                        value: "teamKos",
                    },
                    {
                        label: "Match Time",
                        value: "matchTime",
                    },
                    {
                        label: "Damage Unarmed",
                        value: "damageUnarmed",
                    },
                    {
                        label: "KOs Unarmed",
                        value: "koUnarmed",
                    },
                    {
                        label: "Match Time Unarmed",
                        value: "matchTimeUnarmed",
                    },
                    {
                        label: "KOs Thrown Item",
                        value: "koThrownItem",
                    },
                    {
                        label: "Damage Thrown Item",
                        value: "damageThrownItem",
                    },
                    {
                        label: "KOs Gadgets",
                        value: "koGadgets",
                    },
                    {
                        label: "Damage Gadgets",
                        value: "damageGadgets",
                    },
                ]}
            />
            <div className="rounded-lg overflow-hidden border border-bg mb-4">
                {players?.map((player, index) => (
                    <div
                        key={player.id}
                        className={cn(
                            "px-4 py-2 w-full h-full flex items-center gap-4 hover:bg-bg",
                            { "bg-bgVar2": index % 2 === 0 },
                        )}
                    >
                        <p className="w-16 h-full flex items-center justify-center text-xs">
                            {(parseInt(page, 10) - 1) *
                                GLOBAL_PLAYER_RANKINGS_PER_PAGE +
                                index +
                                1}
                        </p>
                        <p className="flex flex-1 items-center">
                            <AppLink href={`/stats/player/${player.id}`}>
                                {cleanString(player.name)}
                            </AppLink>
                        </p>
                        <div className="w-40 flex items-center justify-center">
                            {player.prop}
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

export default Page
