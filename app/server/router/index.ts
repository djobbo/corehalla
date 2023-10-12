import { router } from "../trpc"
import { usersRouter } from "./users"

export const appRouter = router({
    users: usersRouter,
})

export type AppRouter = typeof appRouter
