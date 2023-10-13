import { getPlayerTeam } from "bhapi/helpers/getTeamPlayers"
import { rankedRegions } from "bhapi/constants"
import type { PlayerRanked } from "bhapi/types"

import { Card } from "ui/base/Card"
import { Image } from "@/components/Image"
import { MiscStatGroup } from "@/components/stats/MiscStatGroup"
import { RatingDisplay } from "@/components/stats/RatingDisplay"
import { calculateWinrate } from "bhapi/helpers/calculateWinrate"
import { cleanString } from "common/helpers/cleanString"
import { cn } from "@/lib/utils"
import { css } from "ui/theme"
import { getLegendEloReset } from "bhapi/calculator"
import { getTierFromRating } from "bhapi/helpers/getTierFromRating"
import Link from "next/link"

type TeamCardProps = {
    playerId: number
    team: PlayerRanked["2v2"][number]
}

const rankedBannerClassName = css({
    top: "0",
    right: "-1rem",
    bottom: "-2rem",
    opacity: 0.08,
    transform: "translateX(25%) rotate(15deg)",
    zIndex: -1,
})()

export const TeamCard = ({ playerId, team }: TeamCardProps) => {
    const { playerName, teammate } = getPlayerTeam(playerId, team)
    const regionTxt = rankedRegions[team.region - 1]?.toUpperCase() ?? "ALL"
    const eloReset = getLegendEloReset(team.rating)

    return (
        <Link href={`/stats/player/${teammate.id}`}>
            <Card
                className="relative overflow-hidden z-0 hover:bg-bgVar2 border border-bg"
                title={
                    <span className="flex items-center">
                        <Image
                            src={`/images/icons/flags/${regionTxt}.png`}
                            alt={regionTxt}
                            Container="span"
                            containerClassName="block w-4 h-4 rounded overflow-hidden mr-2"
                            className="object-contain object-center"
                        />
                        {cleanString(playerName)} {"&"}{" "}
                        {cleanString(teammate.name)}
                    </span>
                }
            >
                <Image
                    src={`/images/ranked-banners/${team.tier}.png`}
                    alt={team.tier}
                    containerClassName={cn(" w-full", rankedBannerClassName)}
                    position="absolute"
                    className="object-contain object-center"
                />
                <RatingDisplay
                    games={team.games}
                    wins={team.wins}
                    peak_rating={team.peak_rating}
                    rating={team.rating}
                />
                <MiscStatGroup
                    className="mt-4 text-center"
                    minItemWidth="4rem"
                    stats={[
                        {
                            name: "Games",
                            value: team.games,
                            desc: "Games played this season",
                        },
                        {
                            name: "Winrate",
                            value: `${calculateWinrate(
                                team.wins,
                                team.games,
                            ).toFixed(2)}%`,
                            desc: "Winrate this season (wins / games)",
                        },
                        {
                            name: "Elo reset",
                            value: eloReset,
                            desc: `Elo reset for next season (${getTierFromRating(
                                eloReset,
                            )})`,
                        },
                    ]}
                />
            </Card>
        </Link>
    )
}
