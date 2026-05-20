import { seoHead } from "#/components/SEO"
import { ClanStatsPage } from "#/views/stats/clan"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/stats/clan/$clanId")({
    loader: ({ context: { trpcProxy }, params }) =>
        trpcProxy.getClanStats.query({ clanId: params.clanId }),
    head: ({ loaderData, params }) =>
        seoHead({
            title: loaderData
                ? `${loaderData.clan_name} - Clan Stats • Corehalla`
                : `Clan ${params.clanId} • Corehalla`,
            description: loaderData
                ? `${loaderData.clan_name} Stats - Brawlhalla Clan Stats • Corehalla`
                : "Brawlhalla clan stats on Corehalla",
        }),
    component: ClanStatsPage,
})
