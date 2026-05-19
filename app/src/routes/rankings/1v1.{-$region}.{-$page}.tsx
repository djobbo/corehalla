import { rankings1v1Seo } from "@components/SEO"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import Rankings1v1Page from "../../../pages/rankings/1v1/[[...rankingsOptions]]"

const searchSchema = z.object({
    player: z.string().optional(),
})

export const Route = createFileRoute("/rankings/1v1/{-$region}/{-$page}")({
    validateSearch: searchSchema,
    head: ({ params, match }) =>
        rankings1v1Seo({
            region: params.region ?? "all",
            page: params.page ?? "1",
            search: match.search.player ?? "",
        }),
    component: Rankings1v1Page,
})
