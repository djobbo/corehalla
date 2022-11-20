import { rankingsRouter } from "./rankings"
import { router } from "../../helpers/trpc"

export const v1Router = router({
    rankings: rankingsRouter,
})
