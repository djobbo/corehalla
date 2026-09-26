import { AppLink } from "ui/base/AppLink"
import { PaginatedRankings } from "@components/stats/rankings/PaginatedRankings"
import { RANKINGS_2V2_PER_PAGE } from "@util/constants"
import { RankingsLayout } from "@components/stats/rankings/RankingsLayout"
import { RankingsTableItem } from "@components/stats/RankingsTableItem"
import { cleanString } from "common/helpers/cleanString"
import { createFileRoute } from "@tanstack/react-router"
import { getTeamPlayers } from "bhapi/helpers/getTeamPlayers"
import { preloadAtoms, rankings2v2Atom } from "@/effect/atoms"
import {
    rankingsBrackets,
    rankingsRegions,
} from "@components/stats/rankings/options"
import { resolvePage, resolveRankedRegion } from "@/lib/routeParams"
import { seoTags } from "@components/SEO"

export const Route = createFileRoute("/rankings/2v2/{-$region}/{-$page}")({
    loader: ({ params, context }) =>
        preloadAtoms(context, [
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

    const region = resolveRankedRegion(regionParam)
    const page = parseInt(resolvePage(pageParam), 10)

    /**
     * The region slot cannot be skipped when a page is present, so pages past 1
     * spell out `all` rather than leave it empty — otherwise the page number
     * would land in the region segment. Page 1 drops both segments.
     */
    const pageHref = (nextPage: number) => {
        if (nextPage <= 1) {
            const regionSegment =
                regionParam && regionParam !== "all" ? `/${regionParam}` : ""

            return `/rankings/2v2${regionSegment}`
        }

        return `/rankings/2v2/${regionParam ?? "all"}/${nextPage}`
    }

    return (
        <RankingsLayout
            brackets={rankingsBrackets}
            currentBracket="2v2"
            regions={rankingsRegions}
            currentRegion={region}
        >
            <PaginatedRankings
                buildAtom={(pageNumber) => rankings2v2Atom(region, pageNumber)}
                page={page}
                pageSize={RANKINGS_2V2_PER_PAGE}
                resetKey={`2v2:${region}`}
                pageHref={pageHref}
                emptyLabel="No teams found"
            >
                {(rows) => (
                    <>
                        <div className="rounded-lg overflow-hidden border border-bg mb-4 flex flex-col">
                            {rows.map(({ row: team, index }) => {
                                const [player1, player2] = getTeamPlayers(team)

                                return (
                                    <RankingsTableItem
                                        key={`${player1.id}-${player2.id}`}
                                        index={index}
                                        content={
                                            <>
                                                <p className="flex flex-1 items-center">
                                                    <AppLink
                                                        href={`/stats/player/${player1.id}`}
                                                    >
                                                        {cleanString(
                                                            player1.name,
                                                        )}
                                                    </AppLink>
                                                </p>
                                                <p className="flex flex-1 items-center">
                                                    <AppLink
                                                        href={`/stats/player/${player2.id}`}
                                                    >
                                                        {cleanString(
                                                            player2.name,
                                                        )}
                                                    </AppLink>
                                                </p>
                                            </>
                                        }
                                        {...team}
                                    />
                                )
                            })}
                        </div>
                    </>
                )}
            </PaginatedRankings>
        </RankingsLayout>
    )
}
