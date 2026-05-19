import RankingsClansPage from "../../../pages/rankings/clans/[[...clansOptions]]"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

const searchSchema = z.object({
    clan: z.string().optional(),
})

export const Route = createFileRoute("/rankings/clans/{-$page}")({
    validateSearch: searchSchema,
    component: RankingsClansPage,
})
