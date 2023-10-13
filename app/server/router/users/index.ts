import { getSingleUser } from "./getSingleUser"
import { router } from "../../trpc"

export const usersRouter = router({
    getSingle: getSingleUser,
})
