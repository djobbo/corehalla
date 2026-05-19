import { router } from "../trpc"
import { getBHArticles } from "./getBHArticles"
import { getWeeklyRotation } from "./getWeeklyRotation"
import { getClansRankings } from "./stats/getClansRankings"
import { getClanStats } from "./stats/getClanStats"
import { getGlobalPlayerRankings } from "./stats/getGlobalPlayerRankings"
import { getPlayerAliases } from "./stats/getPlayerAliases"
import { getPlayerRanked } from "./stats/getPlayerRanked"
import { getPlayerStats } from "./stats/getPlayerStats"
import { getPowerRankings } from "./stats/getPowerRankings"
import { get1v1Rankings, get2v2Rankings } from "./stats/getRankings"
import { searchPlayerAlias } from "./stats/searchPlayerAlias"

export const appRouter = router({
    get1v1Rankings,
    get2v2Rankings,
    getClansRankings,
    getPowerRankings,
    getPlayerStats,
    getPlayerRanked,
    getPlayerAliases,
    getClanStats,
    searchPlayerAlias,
    getWeeklyRotation,
    getBHArticles,
    getGlobalPlayerRankings,
})

export type AppRouter = typeof appRouter
