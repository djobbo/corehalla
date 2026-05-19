import { rankingsPowerSeo } from "@components/SEO"
import { createFileRoute } from "@tanstack/react-router"
import { RankingsPowerPage } from "@views/rankings/power"

export const Route = createFileRoute("/rankings/power/$bracket/$region")({
    head: ({ params }) =>
        rankingsPowerSeo({
            bracket: params.bracket,
            region: params.region,
        }),
    component: RankingsPowerPage,
})
