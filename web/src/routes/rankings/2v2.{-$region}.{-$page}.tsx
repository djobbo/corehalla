import { AppLink } from "ui/base/AppLink"
import { InfiniteRankings } from "@components/stats/rankings/InfiniteRankings"
import { RankingsLayout } from "@components/stats/rankings/RankingsLayout"
import { RankingsTableItem } from "@components/stats/RankingsTableItem"
import { cleanString } from "common/helpers/cleanString"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { getTeamPlayers } from "bhapi/helpers/getTeamPlayers"
import { loadAtoms, rankings2v2Atom } from "@/effect/atoms"
import {
    rankingsBrackets,
    rankingsRegions,
} from "@components/stats/rankings/options"
import { resolvePage, resolveRankedRegion } from "@/lib/routeParams"
import { seoTags } from "@components/SEO"
import { useCallback } from "react"

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
    const navigate = useNavigate()

    const region = resolveRankedRegion(regionParam)
    const page = parseInt(resolvePage(pageParam), 10)

    const syncPage = useCallback(
        (nextPage: number) => {
            navigate({
                to: "/rankings/2v2/{-$region}/{-$page}",
                // The region segment cannot be skipped, so paging past page 1
                // needs a concrete region ("all") to avoid writing the page
                // number into the region slot.
                params:
                    nextPage > 1
                        ? {
                              region: regionParam ?? "all",
                              page: String(nextPage),
                          }
                        : {
                              region:
                                  regionParam === "all"
                                      ? undefined
                                      : regionParam,
                              page: undefined,
                          },
                replace: true,
            })
        },
        [navigate, regionParam],
    )

    return (
        <RankingsLayout
            brackets={rankingsBrackets}
            currentBracket="2v2"
            regions={rankingsRegions}
            currentRegion={region}
        >
            <InfiniteRankings
                buildAtom={(pageNumber) => rankings2v2Atom(region, pageNumber)}
                initialPage={page}
                resetKey={`2v2:${region}`}
                onHighestPageChange={syncPage}
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
            </InfiniteRankings>
        </RankingsLayout>
    )
}
