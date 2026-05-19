import { rankings2v2Seo } from "@components/SEO"
import { createFileRoute } from "@tanstack/react-router"

import Rankings2v2Page from "../../../pages/rankings/2v2/[[...rankingsOptions]]"

export const Route = createFileRoute("/rankings/2v2/{-$region}/{-$page}")({
    head: ({ params }) =>
        rankings2v2Seo({
            region: params.region ?? "all",
            page: params.page ?? "1",
        }),
    component: Rankings2v2Page,
})
