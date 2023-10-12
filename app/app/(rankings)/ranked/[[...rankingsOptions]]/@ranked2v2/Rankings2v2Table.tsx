import { type Ranking2v2 } from "bhapi/types"
import { RankingsTableItem } from "@/app/(rankings)/RankingsTableItem"
import { cleanString } from "common/helpers/cleanString"
import { getTeamPlayers } from "bhapi/helpers/getTeamPlayers"
import Link from "next/link"

type Rankings2v2TableProps = {
    rankings: Ranking2v2[]
}

export const Rankings2v2Table = ({ rankings }: Rankings2v2TableProps) => {
    return (
        <div className="rounded-lg overflow-hidden border border-bg mb-4 flex flex-col">
            {rankings.map((team, i) => {
                const [player1, player2] = getTeamPlayers(team)
                return (
                    <RankingsTableItem
                        key={`${player1.id}-${player2.id}`}
                        index={i}
                        content={
                            <>
                                <p className="flex flex-1 items-center">
                                    <Link href={`/stats/player/${player1.id}`}>
                                        {cleanString(player1.name)}
                                    </Link>
                                </p>
                                <p className="flex flex-1 items-center">
                                    <Link href={`/stats/player/${player2.id}`}>
                                        {cleanString(player2.name)}
                                    </Link>
                                </p>
                            </>
                        }
                        {...team}
                    />
                )
            })}
        </div>
    )
}
