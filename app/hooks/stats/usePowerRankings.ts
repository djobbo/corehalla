// TS2742: https://github.com/microsoft/TypeScript/issues/47663
import {} from "@tanstack/query-core"
import { trpc } from "@util/trpc"
import type {
    PowerRankingsBracket,
    PowerRankingsRegion,
} from "web-parser/power-rankings/parsePowerRankingsPage"

export const usePowerRankings = (
    bracket: PowerRankingsBracket,
    region: PowerRankingsRegion,
) => {
    const { data: powerRankings, ...query } = trpc.getPowerRankings.useQuery({
        bracket,
        region,
    })

    return {
        powerRankings,
        ...query,
    }
}
