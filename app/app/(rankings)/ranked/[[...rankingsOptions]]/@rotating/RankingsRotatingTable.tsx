"use client"

import { Image } from "@/components/Image"
import { type Ranking1v1 } from "bhapi/types"
import { RankingsTableItem } from "@/app/(rankings)/RankingsTableItem"
import { cleanString } from "common/helpers/cleanString"
import { legendsMap } from "bhapi/legends"
import { useSearch } from "@/app/(rankings)/SearchProvider"
import Link from "next/link"

type Rankings1v1TableProps = {
    rankings: Ranking1v1[]
}

export const RankingsRotatingTable = ({ rankings }: Rankings1v1TableProps) => {
    const { search } = useSearch((state) => state)

    return (
        <div className="rounded-lg overflow-hidden border border-bg mb-4 flex flex-col">
            {rankings
                ?.filter((player) =>
                    player.name.toLowerCase().startsWith(search.toLowerCase()),
                )
                .map((player, i) => {
                    const legend = legendsMap[player.best_legend]

                    return (
                        <RankingsTableItem
                            key={player.brawlhalla_id}
                            index={i}
                            content={
                                <Link
                                    href={`/stats/player/${player.brawlhalla_id}`}
                                    className="flex flex-1 items-center gap-2 md:gap-3"
                                >
                                    {legend && (
                                        <Image
                                            src={`/images/icons/roster/legends/${legend.legend_name_key}.png`}
                                            alt={legend.bio_name}
                                            containerClassName="w-6 h-6 rounded-lg overflow-hidden"
                                            className="object-cover object-center"
                                        />
                                    )}
                                    {cleanString(player.name)}
                                </Link>
                            }
                            {...player}
                        />
                    )
                })}
        </div>
    )
}
