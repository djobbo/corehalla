import { rankings2v2Seo } from "#/components/SEO"
import { Rankings2v2Page } from "#/views/rankings/2v2"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/rankings/2v2/{-$region}/{-$page}")({
    head: ({ params }) =>
        rankings2v2Seo({
            region: params.region ?? "all",
            page: params.page ?? "1",
        }),
    component: Rankings2v2Page,
})
