import { rankingsClansSeo } from "@components/SEO"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import RankingsClansPage from "../../../pages/rankings/clans/[[...clansOptions]]"

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
