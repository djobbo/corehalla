import { Image } from "@components/Image"
import { MiscStatGroup } from "../../MiscStatGroup"
import { SectionTitle } from "../../../layout/SectionTitle"
import { calculateWinrate } from "bhapi/helpers/calculateWinrate"
import { memo } from "react"
import type { FullLegend, FullWeapon } from "bhapi/legends"
import type { MiscStat } from "../../MiscStatGroup"

type PlayerWeaponRankedContentProps = {
    weapon: FullWeapon
}

export const PlayerWeaponRankedContent = memo(
    function PlayerWeaponRankedContent({
        weapon,
    }: PlayerWeaponRankedContentProps) {
        const ranked = weapon.legends.reduce<{
            games: number
            wins: number
            totalRating: number
            totalPeakRating: number
            mostPlayedLegend?: FullLegend
            highestRatedLegend?: FullLegend
            highestPeakRatedLegend?: FullLegend
            hasPlayedRanked: boolean
        }>(
            (acc, legend) => {
                if (!legend.ranked) return acc

                return {
                    games: acc.games + legend.ranked.games,
                    wins: acc.wins + legend.ranked.wins,
                    totalRating: acc.totalRating + legend.ranked.rating,
                    totalPeakRating:
                        acc.totalPeakRating + legend.ranked.peak_rating,
                    mostPlayedLegend:
                        (acc.mostPlayedLegend?.ranked?.games ?? 0) <
                        legend.ranked.games
                            ? legend
                            : acc.mostPlayedLegend,
                    highestRatedLegend:
                        (acc.highestRatedLegend?.ranked?.rating ?? 0) <
                        legend.ranked.rating
                            ? legend
                            : acc.highestRatedLegend,
                    highestPeakRatedLegend:
                        (acc.highestPeakRatedLegend?.ranked?.peak_rating ?? 0) <
                        legend.ranked.peak_rating
                            ? legend
                            : acc.highestPeakRatedLegend,
                    hasPlayedRanked: true,
                }
            },
            {
                games: 0,
                wins: 0,
                totalRating: 0,
                totalPeakRating: 0,
                hasPlayedRanked: false,
            },
        )

        if (!ranked.hasPlayedRanked) return null

        const rating = Math.floor(ranked.totalRating / weapon.legends.length)
        const peakRating = Math.floor(
            ranked.totalPeakRating / weapon.legends.length,
        )

        const rankedStats: MiscStat[] = [
            {
                name: "Games",
                value: ranked.games,
                desc: "1v1 Ranked games played this season",
            },
            {
                name: "Wins",
                value: ranked.wins,
                desc: "1v1 Ranked wins this season",
            },
            {
                name: "Losses",
                value: ranked.games - ranked.wins,
                desc: "1v1 Ranked losses this season",
            },
            {
                name: "Winrate",
                value: `${calculateWinrate(ranked.wins, ranked.games).toFixed(
                    2,
                )}%`,
                desc: "Ranked winrate (ranked wins / ranked games)",
            },
            {
                name: "Most played",
                value: ranked.mostPlayedLegend ? (
                    <div className="flex items-center gap-2">
                        <Image
                            src={`/images/icons/roster/legends/${ranked.mostPlayedLegend.legend_name_key}.png`}
                            alt={ranked.mostPlayedLegend.bio_name}
                            containerClassName="w-8 h-8 overflow-hidden rounded-sm"
                            className="object-contain object-center"
                        />
                        {ranked.mostPlayedLegend.ranked?.games} games
                    </div>
                ) : (
                    <>None</>
                ),
                desc: "Legend that has played the most games with this weapon",
            },
            {
                name: "Highest elo",
                value: ranked.highestRatedLegend ? (
                    <div className="flex items-center gap-2">
                        <div className="">
                            <Image
                                src={`/images/icons/roster/legends/${ranked.highestRatedLegend.legend_name_key}.png`}
                                alt={ranked.highestRatedLegend.bio_name}
                                containerClassName="w-8 h-8 overflow-hidden rounded-sm"
                                className="object-contain object-center"
                            />
                        </div>
                        {ranked.highestRatedLegend.ranked?.rating} elo
                    </div>
                ) : (
                    <>None</>
                ),
                desc: "Legend that has the highest elo with this weapon",
            },
            {
                name: "Highest peak elo",
                value: ranked.highestPeakRatedLegend ? (
                    <div className="flex items-center gap-2">
                        <Image
                            src={`/images/icons/roster/legends/${ranked.highestPeakRatedLegend.legend_name_key}.png`}
                            alt={ranked.highestPeakRatedLegend.bio_name}
                            containerClassName="w-8 h-8 overflow-hidden rounded-sm"
                            className="object-contain object-center"
                        />
                        {ranked.highestPeakRatedLegend.ranked?.rating} elo
                    </div>
                ) : (
                    <>None</>
                ),
                desc: "Legend that has the highest peak elo with this weapon",
            },
            {
                name: "Average elo",
                value: rating,
                desc: "Average elo of the legends that use this weapon",
            },
            {
                name: "Average peak elo",
                value: peakRating,
                desc: "Average peak elo of the legends that use this weapon",
            },
        ]

        return (
            <>
                <SectionTitle hasBorder customMargin className="my-4">
                    Ranked Season
                </SectionTitle>
                <MiscStatGroup className="mt-4" stats={rankedStats} />
            </>
        )
    },
)
