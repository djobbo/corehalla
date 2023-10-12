"use client"

import { type BHClan } from "db/generated/client"
import { CLANS_RANKINGS_PER_PAGE } from "./constants"
import { cleanString } from "common/helpers/cleanString"
import { cn } from "common/helpers/classnames"
import { formatUnixTime } from "common/helpers/date"
import { useSearch } from "../../SearchProvider"
import Link from "next/link"

type ClansTableProps = {
    clans: BHClan[]
    page: number
}

export const ClansTable = ({ clans, page }: ClansTableProps) => {
    const { search, defaultSearch } = useSearch((state) => state)

    const showClanRank = !defaultSearch

    return (
        <div className="rounded-lg overflow-hidden border border-bg my-4">
            {clans
                .filter((clan) =>
                    clan.name.toLowerCase().startsWith(search.toLowerCase()),
                )
                .map((clan, index) => (
                    <div
                        key={clan.id}
                        className={cn(
                            "px-4 py-2 w-full h-full flex items-center gap-4 hover:bg-bg",
                            { "bg-bgVar2": index % 2 === 0 },
                        )}
                    >
                        {showClanRank && (
                            <p className="w-16 h-full flex items-center justify-center text-xs">
                                {(page - 1) * CLANS_RANKINGS_PER_PAGE +
                                    index +
                                    1}
                            </p>
                        )}
                        <p className="flex flex-1 items-center">
                            <Link href={`/clan/${clan.id}`}>
                                {cleanString(clan.name)}
                            </Link>
                        </p>
                        <div className="w-40 flex items-center justify-center">
                            {!!clan.created && clan.created > 0
                                ? formatUnixTime(clan.created)
                                : "N/A"}
                        </div>
                        <p className="w-20 text-center">{clan.xp}</p>
                    </div>
                ))}
        </div>
    )
}
