import { AppLink } from "ui/base/AppLink"
import { cleanString } from "common/helpers/cleanString"
import { legendsMap } from "bhapi/legends"
import { useKBar } from "kbar"
import Image from "next/image"
import type { Ranking1v1 } from "bhapi/types"

type SearchboxItemProps = {
    player: Ranking1v1
}

export const SearchboxItem = ({ player }: SearchboxItemProps) => {
    const legend = legendsMap[player.best_legend]
    const {
        query: { toggle },
    } = useKBar()

    const icon = legend && (
        <div
            className="w-8 h-8 relative rounded-lg overflow-hidden border border-textVar1"
            key={legend.legend_id}
        >
            <Image
                src={`/images/icons/roster/legends/${legend.bio_name}.png`}
                alt={legend.bio_name}
                layout="fill"
                objectFit="contain"
                objectPosition="center"
            />
        </div>
    )

    return (
        <AppLink
            href={`/stats/player/${player.brawlhalla_id}`}
            onClick={() => toggle()}
            className="px-4 py-3 w-full flex items-center border-b cursor-pointer border-bgVar2 hover:bg-bg"
        >
            {icon}
            <div className="ml-4">
                <p>{cleanString(player.name)}</p>
                <p className="text-xs text-textVar1">
                    {player.rating} / {player.peak_rating} peak ({player.tier})
                </p>
            </div>
        </AppLink>
    )
}