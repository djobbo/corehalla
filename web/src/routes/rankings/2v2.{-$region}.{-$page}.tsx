import { AppLink } from "ui/base/AppLink"
import { RankingsLayout } from "@components/stats/rankings/RankingsLayout"
import { RankingsTableItem } from "@components/stats/RankingsTableItem"
import { cleanString } from "common/helpers/cleanString"
import { createFileRoute } from "@tanstack/react-router"
import { getTeamPlayers } from "bhapi/helpers/getTeamPlayers"
import { loadAtoms, rankings2v2Atom, useQuery } from "@/effect/atoms"
import {
    rankingsBrackets,
    rankingsRegions,
} from "@components/stats/rankings/options"
import { resolvePage, resolveRankedRegion } from "@/lib/routeParams"
import { seoTags } from "@components/SEO"

export const Route = createFileRoute("/rankings/2v2/{-$region}/{-$page}")({
    loader: ({ params, context }) =>
        loadAtoms(context, [
            rankings2v2Atom(
                resolveRankedRegion(params.region),
                parseInt(resolvePage(params.page)),
            ),
        ]),
    head({ params }) {
        const region = resolveRankedRegion(params?.region)
        const page = resolvePage(params?.page)
        const label = region === "all" ? "Global" : region.toUpperCase()
        return {
            meta: seoTags({
                title: `Brawlhalla ${label} 2v2 Rankings - Page ${page} • Corehalla`,
                description: `Brawhalla ${label} 2v2 Rankings - Page ${page} • Corehalla`,
            }),
        }
    },
    component: Page,
})

function Page() {
    const { region: regionParam, page: pageParam } = Route.useParams()

    const rankings2v2 = useQuery(
        rankings2v2Atom(
            resolveRankedRegion(regionParam),
            parseInt(resolvePage(pageParam)),
        ),
    )

    return (
        <RankingsLayout
            brackets={rankingsBrackets}
            currentBracket="2v2"
            regions={rankingsRegions}
            currentRegion={resolveRankedRegion(regionParam)}
            currentPage={resolvePage(pageParam)}
            hasPagination
        >
            <div className="py-4 w-full h-full hidden md:flex items-center gap-4">
                <p className="w-16 text-center">Rank</p>
                <p className="w-8 text-center">Tier</p>
                <p className="w-16 text-center">Region</p>
                <p className="flex-1">Player 1</p>
                <p className="flex-1">Player 2</p>
                <p className="w-16 text-center">Games</p>
                <p className="w-32 text-center">W/L</p>
                <p className="w-20 text-center">Winrate</p>
                <p className="w-40 pl-1">Elo</p>
            </div>
            <div className="rounded-lg overflow-hidden border border-bg mb-4 flex flex-col">
                {rankings2v2.map((team, i) => {
                    const [player1, player2] = getTeamPlayers(team)
                    return (
                        <RankingsTableItem
                            key={`${player1.id}-${player2.id}`}
                            index={i}
                            content={
                                <>
                                    <p className="flex flex-1 items-center">
                                        <AppLink
                                            href={`/stats/player/${player1.id}`}
                                        >
                                            {cleanString(player1.name)}
                                        </AppLink>
                                    </p>
                                    <p className="flex flex-1 items-center">
                                        <AppLink
                                            href={`/stats/player/${player2.id}`}
                                        >
                                            {cleanString(player2.name)}
                                        </AppLink>
                                    </p>
                                </>
                            }
                            {...team}
                        />
                    )
                })}
            </div>
        </RankingsLayout>
    )
}
