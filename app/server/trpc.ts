import { initTRPC } from "@trpc/server"
import SuperJSON from "superjson"

const t = initTRPC.create({
    transformer: SuperJSON,
})

export const router = t.router
export const publicProcedure = t.procedure
