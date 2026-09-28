import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty"
import { SortControl } from "@/components/SortControl"
import { StatGrid } from "@/components/StatGrid"
import { TeamCard } from "./TeamCard"
import { playerRankedAtom, useQuery } from "@/effect/atoms"
import { isPairedTeam } from "@/lib/rankings"
import { ratio } from "@/lib/stats"
import { useSortBy } from "@/lib/useSortBy"
import { calculateWinrate } from "@crh/bhapi/helpers/calculateWinrate"
import type { PlayerRanked } from "@crh/bhapi/types"
import type { SortOption } from "@/lib/useSortBy"
import type { Stat } from "@/components/StatGrid"

/**
 * Every 2v2 team this player has queued with.
 *
 * A summary of the season's teams first — totals are what a 2v2 profile is
 * usually asked for — then the teams themselves as a grid of cards, because each
 * one is a pair of people rather than a row in a table.
 */

type Team = PlayerRanked["2v2"][number]

type TeamSort = "rating" | "peak" | "games" | "wins" | "losses" | "winrate"

const losses = (team: Team): number => team.games - team.wins
const winrate = (team: Team): number => calculateWinrate(team.wins, team.games)

const sortOptions: Record<TeamSort, SortOption<Team>> = {
    rating: {
        label: "Elo",
        compare: (a, b) => a.rating - b.rating,
        display: (team) => `${team.rating} elo`,
    },
    peak: {
        label: "Peak elo",
        compare: (a, b) => a.peak_rating - b.peak_rating,
        display: (team) => `${team.peak_rating} peak elo`,
    },
    games: {
        label: "Games",
        compare: (a, b) => a.games - b.games,
        display: (team) => `${team.games.toLocaleString()} games`,
    },
    wins: {
        label: "Wins",
        compare: (a, b) => a.wins - b.wins,
        display: (team) => `${team.wins.toLocaleString()} wins`,
    },
    losses: {
        label: "Losses",
        compare: (a, b) => losses(a) - losses(b),
        display: (team) => `${losses(team).toLocaleString()} losses`,
    },
    winrate: {
        label: "Winrate",
        compare: (a, b) => winrate(a) - winrate(b),
        display: (team) => `${winrate(team).toFixed(2)}% winrate`,
    },
}

export const TeamsTab = ({ playerId }: { readonly playerId: number }) => {
    const ranked = useQuery(playerRankedAtom(playerId))
    /* Solo-queue rows are not teams and get their own card on the overview. */
    const teams = (ranked?.["2v2"] ?? []).filter(isPairedTeam)

    const sort = useSortBy(teams, sortOptions, "rating", "desc")

    if (teams.length === 0) {
        return (
            <Empty className="bg-bgVar2 py-10">
                <EmptyHeader>
                    <EmptyDescription>
                        No 2v2 ranked record for this player.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    const totalGames = teams.reduce((sum, team) => sum + team.games, 0)
    const totalWins = teams.reduce((sum, team) => sum + team.wins, 0)
    const totalRating = teams.reduce((sum, team) => sum + team.rating, 0)
    const totalPeak = teams.reduce((sum, team) => sum + team.peak_rating, 0)
    const count = teams.length
    const totalLosses = totalGames - totalWins

    const summary: Stat[] = [
        { title: "Total games", value: totalGames.toLocaleString() },
        { title: "Total wins", value: totalWins.toLocaleString() },
        { title: "Total losses", value: totalLosses.toLocaleString() },
        {
            title: "Winrate",
            value: `${calculateWinrate(totalWins, totalGames).toFixed(2)}%`,
        },
        { title: "Teammates", value: count.toLocaleString() },
        {
            title: "Games per teammate",
            value: ratio(totalGames, count).toFixed(2),
        },
        {
            title: "Wins per teammate",
            value: ratio(totalWins, count).toFixed(2),
        },
        {
            title: "Losses per teammate",
            value: ratio(totalLosses, count).toFixed(2),
        },
        {
            title: "Average team elo",
            value: ratio(totalRating, count).toFixed(0),
        },
        {
            title: "Average peak elo",
            value: ratio(totalPeak, count).toFixed(0),
        },
    ]

    return (
        <div className="flex flex-col gap-4">
            <Card className="bg-background">
                <CardContent>
                    <StatGrid stats={summary} />
                </CardContent>
            </Card>

            <SortControl
                label="Sort by"
                value={sort.key}
                choices={sort.choices}
                onChange={sort.setKey}
                direction={sort.direction}
                onToggleDirection={sort.toggleDirection}
                className="sm:max-w-sm"
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {sort.sorted.map((team) => (
                    <TeamCard
                        key={`${team.brawlhalla_id_one}-${team.brawlhalla_id_two}`}
                        team={team}
                    />
                ))}
            </div>
        </div>
    )
}
