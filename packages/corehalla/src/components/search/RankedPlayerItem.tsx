import { HiOutlineStar } from "@react-icons/all-files/hi2/HiOutlineStar"
import { HiStar } from "@react-icons/all-files/hi2/HiStar"

import { Image } from "../../components/Image"
import { SearchboxItem } from "./SearchboxItem"
import { cleanString } from "common/helpers/cleanString"
import { legendsMap } from "bhapi/legends"
import { useAuth, useFavorites } from "../../providers/auth/AuthProvider"
import type { Ranking1v1 } from "bhapi/types"

type RankedPlayerItemProps = {
    player: Ranking1v1
}

export const RankedPlayerItem = ({ player }: RankedPlayerItemProps) => {
    const { isLoggedIn } = useAuth()
    const { addFavorite, isFavorite, removeFavorite } = useFavorites()

    const legend = legendsMap[player.best_legend]

    const icon = legend && (
        <Image
            key={legend.legend_id}
            src={`/images/icons/roster/legends/${legend.legend_name_key}.png`}
            alt={legend.bio_name}
            containerClassName="w-8 h-8 rounded-lg overflow-hidden border border-textVar1"
            className="object-contain object-center"
        />
    )

    const isFav = isFavorite({
        id: player.brawlhalla_id.toString(),
        type: "player",
    })

    return (
        <SearchboxItem
            icon={icon}
            href={`/stats/player/${player.brawlhalla_id}`}
            title={cleanString(player.name)}
            subtitle={
                <>
                    {player.rating} / {player.peak_rating} peak ({player.tier})
                </>
            }
            rightContent={
                isLoggedIn && (
                    <button
                        className="cursor-pointer"
                        onClick={(e) => {
                            if (!isLoggedIn) return

                            e.preventDefault()
                            e.stopPropagation()

                            if (isFav) {
                                removeFavorite({
                                    id: player.brawlhalla_id.toString(),
                                    type: "player",
                                    name: player.name,
                                })

                                return
                            }

                            addFavorite({
                                id: player.brawlhalla_id.toString(),
                                name: player.name,
                                type: "player",
                                meta: {
                                    icon: {
                                        legend_id: legend?.legend_id,
                                        type: "legend",
                                    },
                                },
                            })
                        }}
                    >
                        {isFav ? (
                            <HiStar size={16} />
                        ) : (
                            <HiOutlineStar size={16} />
                        )}
                    </button>
                )
            }
        />
    )
}
