import { getClansRankings } from "./getClansRankings"
import { getPowerRankings } from "./getPowerRankings"
import { router } from "../../../helpers/trpc"

export const rankingsRouter = router({
    getPowerRankings,
    getClansRankings,
})
