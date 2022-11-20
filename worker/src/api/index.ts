import * as trpcExpress from "@trpc/server/adapters/express"
import { initTRPC } from "@trpc/server"
import { publicProcedure, router } from "../helpers/trpc"
import { v1Router } from "./v1"
import cors from "cors"
import express from "express"
import type { inferAsyncReturnType } from "@trpc/server"

const PORT = process.env.WORKER_PORT || 8080

const createContext = ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    req,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    res,
}: trpcExpress.CreateExpressContextOptions) => ({})
type Context = inferAsyncReturnType<typeof createContext>
const t = initTRPC.context<Context>().create()

const appRouter = t.router({
    v1: v1Router,
    hello: router({ hi: publicProcedure.query(() => "Hello, world!") }),
})

const app = express()

app.use(cors())

app.get("/", (req, res) => {
    res.send("Hello Corehalla!")
})

app.use(
    "/",
    trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext,
    }),
)

export const startApi = async () => {
    app.listen(PORT, () => {
        console.log(`API listening on port ${PORT}`)
    })
}

export type AppRouter = typeof appRouter
