import { getBHArticles } from "./getBHArticles"
import { getClanStats } from "./stats/getClanStats"
import { getClansRankings } from "./stats/getClansRankings"
import { getPlayerAliases } from "./stats/getPlayerAliases"
import { getPlayerRanked } from "./stats/getPlayerRanked"
import { getPlayerStats } from "./stats/getPlayerStats"
import { getPowerRankings } from "./stats/getPowerRankings"
import { getWeeklyRotation } from "./getWeeklyRotation"
import { router } from "../trpc"
import { searchPlayerAlias } from "./stats/searchPlayerAlias"

export const appRouter = router({
    getClansRankings,
    getPowerRankings,
    getPlayerStats,
    getPlayerRanked,
    getPlayerAliases,
    getClanStats,
    searchPlayerAlias,
    getWeeklyRotation,
    getBHArticles,
})

export type AppRouter = typeof appRouter
