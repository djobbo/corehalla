import { rankingsClansSeo } from "@components/SEO"
import { createFileRoute } from "@tanstack/react-router"
import { RankingsClansPage } from "@views/rankings/clans"
import { z } from "zod"

const searchSchema = z.object({
    clan: z.string().optional(),
})

export const Route = createFileRoute("/rankings/clans/{-$page}")({
    validateSearch: searchSchema,
    head: ({ params }) =>
        rankingsClansSeo({
            page: params.page ?? "1",
        }),
    component: RankingsClansPage,
})
