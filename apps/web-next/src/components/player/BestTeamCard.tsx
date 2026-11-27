import { Link } from "@tanstack/react-router"
import { EntityLink } from "@/components/common/EntityLink"
import { RankedCard } from "./RankedCard"
import { playerHref } from "@/lib/rankings"
import { percent } from "@/lib/stats"
import { teamPartner } from "@/lib/teams"
import { cleanString } from "@crh/common/helpers/cleanString"
import type {
    PlayerRanked2v2,
    PlayerRankedTeam,
} from "@crh/api-contract/schemas"

/**
 * The overview's headline pair: the partner, the team's ranked record, and the
 * player's whole 2v2 summary, linking to the full record.
 */
export const BestTeamCard = ({
    playerId,
    team,
    pairedTeams,
    summary,
    playerSlug,
}: {
    readonly playerId: number
    readonly team: PlayerRankedTeam
    readonly pairedTeams: number
    readonly summary: PlayerRanked2v2 | null
    readonly playerSlug: string
}) => {
    const partner = teamPartner(playerId, team)

    return (
        <RankedCard
            title="Best 2v2 team"
            tier={team.tier}
            region={team.region}
            rating={team.rating}
            peakRating={team.peak_rating}
            wins={team.wins}
            games={team.games}
            globalRank={team.global_rank}
            meta={
                <span className="text-sm">
                    with{" "}
                    <EntityLink
                        type="player"
                        id={partner.id}
                        href={playerHref(partner.slug)}
                        className="font-bold"
                    >
                        {cleanString(partner.name)}
                    </EntityLink>
                </span>
            }
            stats={[
                { title: "Games", value: team.games.toLocaleString() },
                {
                    title: "Win rate",
                    value: `${percent(team.wins, team.games).toFixed(2)}%`,
                },
            ]}
            footer={
                <div className="mt-3 flex flex-col gap-1.5">
                    {summary === null ? null : (
                        <p className="text-xs text-muted-foreground">
                            {pairedTeams.toLocaleString()} paired teams ·{" "}
                            {summary.games.toLocaleString()} games ·{" "}
                            {summary.average_rating.toFixed(0)} average rating
                        </p>
                    )}
                    <Link
                        to={playerHref(playerSlug, "2v2")}
                        className="text-sm font-bold transition-colors hover:text-ring"
                    >
                        Full 2v2 record
                    </Link>
                </div>
            }
        />
    )
}
