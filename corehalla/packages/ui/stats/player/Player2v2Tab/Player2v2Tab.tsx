import { MiscStatGroup } from "../../MiscStatGroup"
import { TeamCard } from "../../TeamCard"
import { calculateWinrate } from "bhapi/helpers/calculateWinrate"
import type { MiscStat } from "../../MiscStatGroup"
import type { PlayerRanked } from "bhapi/types"

type Player2v2TabProps = {
    ranked: PlayerRanked
}

export const Player2v2Tab = ({ ranked }: Player2v2TabProps) => {
    const teams = ranked["2v2"]
    const { totalWins, totalGames, totalRating, totalPeakRating } = ranked[
        "2v2"
    ].reduce(
        ({ totalWins, totalGames, totalRating, totalPeakRating }, team) => ({
            totalWins: totalWins + team.wins,
            totalGames: totalGames + team.games,
            totalRating: totalRating + team.rating,
            totalPeakRating: totalPeakRating + team.peak_rating,
        }),
        {
            totalWins: 0,
            totalGames: 0,
            totalRating: 0,
            totalPeakRating: 0,
        },
    )

    const teamCount = teams.length

    const global2v2Stats: MiscStat[] = [
        {
            name: "Total games",
            value: totalGames,
        },
        {
            name: "Total wins",
            value: totalWins,
        },
        {
            name: "Total losses",
            value: totalGames - totalWins,
        },
        {
            name: "Winrate",
            value: `${calculateWinrate(totalWins, totalGames).toFixed(2)}%`,
        },
        {
            name: "Teammates",
            value: teamCount,
        },
        {
            name: "Avg. games per teammate",
            value: (totalGames / teamCount).toFixed(2),
        },
        {
            name: "Avg. wins per teammate",
            value: (totalWins / teamCount).toFixed(2),
        },
        {
            name: "Avg. losses per teammate",
            value: ((totalGames - totalWins) / teamCount).toFixed(2),
        },
        {
            name: "Avg. team rating",
            value: (totalRating / teamCount).toFixed(0),
        },
        {
            name: "Avg. team peak rating",
            value: (totalPeakRating / teamCount).toFixed(0),
        },
    ]

    return (
        <>
            <MiscStatGroup className="mt-8" stats={global2v2Stats} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-8 gap-8">
                {teams
                    .slice(0)
                    .sort((a, b) => b.rating - a.rating)
                    .map((team) => (
                        <TeamCard
                            key={`${team.brawlhalla_id_one}+${team.brawlhalla_id_two}`}
                            playerId={ranked.brawlhalla_id}
                            team={team}
                        />
                    ))}
            </div>
        </>
    )
}
