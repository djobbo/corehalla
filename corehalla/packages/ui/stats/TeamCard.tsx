import { getTeamPlayers } from "bhapi/helpers/getTeamPlayers"
import { rankedRegion } from "bhapi/constants"
import Link from "next/link"
import type { PlayerRanked } from "bhapi/types"

import { Card } from "../base/Card"
import { MiscStatGroup } from "./MiscStatGroup"
import { RatingDisplay } from "./RatingDisplay"
import { calculateWinrate } from "bhapi/helpers/calculateWinrate"
import { cleanString } from "common/helpers/cleanString"
import { cn } from "common/helpers/classnames"
import { css } from "../theme"
import { getLegendEloReset } from "bhapi/calculator"
import { getMiniTierFromRating } from "bhapi/helpers/getTierFromRating"
import Image from "next/image"

interface Props {
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

export const TeamCard = ({ playerId, team }: Props): JSX.Element => {
    const { playerName, teammate } = getTeamPlayers(playerId, team)
    const regionTxt = rankedRegion[team.region] ?? "all"
    const eloReset = getLegendEloReset(team.rating)

    return (
        <Card
            className="relative overflow-hidden z-0"
            title={
                <Link href={`/stats/player/${teammate.id}`}>
                    <a className="flex items-center">
                        <span className="block relative w-4 h-4 rounded overflow-hidden mr-2">
                            <Image
                                src={`/images/icons/flags/${regionTxt}.png`}
                                alt={regionTxt}
                                layout="fill"
                                objectFit="contain"
                                objectPosition="center"
                            />
                        </span>
                        {cleanString(playerName)} {"&"}{" "}
                        {cleanString(teammate.name)}
                    </a>
                </Link>
            }
        >
            <div className={cn("absolute w-full", rankedBannerClassName)}>
                <Image
                    src={`/images/ranked-banners/${team.tier}.png`}
                    alt={team.tier}
                    layout="fill"
                    objectFit="contain"
                    objectPosition="center"
                />
            </div>
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
                    },
                    {
                        name: "Winrate",
                        value: `${calculateWinrate(
                            team.wins,
                            team.games,
                        ).toFixed(2)}%`,
                    },
                    {
                        name: "Elo reset",
                        value: (
                            <>
                                {eloReset}{" "}
                                <span className="text-xs">
                                    ({getMiniTierFromRating(eloReset)})
                                </span>
                            </>
                        ),
                    },
                ]}
            />
        </Card>
    )
}
