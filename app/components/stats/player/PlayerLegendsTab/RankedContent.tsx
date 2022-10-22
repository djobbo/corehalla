import { MiscStatGroup } from "../../MiscStatGroup"
import { RatingDisplay } from "../../RatingDisplay"
import { SectionTitle } from "../../../layout/SectionTitle"
import { calculateWinrate } from "bhapi/helpers/calculateWinrate"
import { getLegendEloReset } from "bhapi/calculator"
import { getTierFromRating } from "bhapi/helpers/getTierFromRating"
import Image from "next/image"
import type { FullLegend } from "bhapi/legends"
import type { MiscStat } from "../../MiscStatGroup"

type PlayerLegendRankedContentProps = {
    ranked: FullLegend["ranked"]
}

export const PlayerLegendRankedContent = ({
    ranked,
}: PlayerLegendRankedContentProps) => {
    if (!ranked) return null

    const eloReset = getLegendEloReset(ranked?.rating)

    const rankedStats: MiscStat[] = [
        {
            name: "Games",
            value: ranked.games,
            desc: "1v1 Ranked games played this season",
        },
        {
            name: "Winrate",
            value: `${calculateWinrate(ranked.wins, ranked.games).toFixed(2)}%`,
            desc: "Ranked winrate (ranked wins / ranked games)",
        },
        ...(eloReset
            ? [
                  {
                      name: "Elo reset",
                      value: <>{eloReset}</>,
                      desc: `Elo reset for next season (${getTierFromRating(
                          eloReset,
                      )})`,
                  },
              ]
            : []),
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
                        alt={ranked.tier ?? "Valhallan"}
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
