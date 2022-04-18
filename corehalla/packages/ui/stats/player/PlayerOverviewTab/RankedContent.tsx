import { MiscStatGroup } from "ui/stats/MiscStatGroup"
import { RatingDisplay } from "ui/stats/RatingDisplay"
import { SectionTitle } from "ui/layout/SectionTitle"
import { calculateWinrate } from "bhapi/helpers/calculateWinrate"
import { getGlory, getPersonalEloReset } from "bhapi/calculator"
import { getTierFromRating } from "bhapi/helpers/getTierFromRating"
import Image from "next/image"
import type { MiscStat } from "ui/stats/MiscStatGroup"
import type { PlayerRanked } from "bhapi/types"

type PlayerOverviewRankedContentProps = {
    ranked: PlayerRanked
}

export const PlayerOverviewRankedContent = ({
    ranked,
}: PlayerOverviewRankedContentProps) => {
    const glory = getGlory(ranked)
    if (!glory.hasPlayedEnoughGames) return null
    const { gloryFromBestRating, gloryFromWins, totalGlory } = glory
    const eloReset = getPersonalEloReset(ranked.rating)

    const rankedStats: MiscStat[] = [
        {
            name: "Games",
            value: ranked.games,
        },
        {
            name: "Winrate",
            value: `${calculateWinrate(ranked.wins, ranked.games).toFixed(2)}%`,
        },
        {
            name: "Total Glory",
            value: totalGlory,
        },
        {
            name: "Glory from best rating",
            value: gloryFromBestRating,
        },
        {
            name: "Glory from wins",
            value: gloryFromWins,
        },
        {
            name: "Elo reset",
            value: (
                <>
                    {eloReset} ({getTierFromRating(eloReset)})
                </>
            ),
        },
    ]

    return (
        <>
            <SectionTitle hasBorder customMargin className="my-4">
                Ranked Season
            </SectionTitle>
            <div className="flex items-center gap-4">
                <div className="relative h-24 w-16">
                    <Image
                        src={`/images/ranked-banners/${ranked.tier}.png`}
                        alt={ranked.tier}
                        layout="fill"
                        objectFit="contain"
                        objectPosition="center"
                    />
                </div>
                <div>
                    <span className="text-sm font-light">{ranked.tier}</span>
                    <RatingDisplay
                        className="w-80"
                        games={ranked.games}
                        wins={ranked.wins}
                        rating={ranked.rating}
                        peak_rating={ranked.peak_rating}
                    />
                </div>
            </div>
            <MiscStatGroup className="mt-4" stats={rankedStats} />
        </>
    )
}
