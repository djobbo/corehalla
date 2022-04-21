import { bg, border, text } from "../theme"
import { cleanString } from "common/helpers/cleanString"
import { cn } from "common/helpers/classnames"
import { legendsMap } from "bhapi/legends"
import { useKBar } from "kbar"
import Image from "next/image"
import Link from "next/link"
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
        <div className="w-8 h-8 relative" key={legend.legend_id}>
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
        <Link href={`/stats/player/${player.brawlhalla_id}`}>
            <a
                onClick={() => toggle()}
                className={cn(
                    "px-4 py-3 w-full flex items-center border-b cursor-pointer",
                    border("blue4"),
                    bg("blue3", "&:hover"),
                )}
            >
                {icon}
                <div className="ml-4">
                    <p>{cleanString(player.name)}</p>
                    <p className={cn("uppercase text-xs", text("blue11"))}>
                        {player.rating} / {player.peak_rating} peak (
                        {player.tier})
                    </p>
                </div>
            </a>
        </Link>
    )
}
