import { AppLink } from "ui/base/AppLink"
import { GLOBAL_PLAYER_RANKINGS_PER_PAGE } from "@util/constants"
import { InfiniteRankings } from "@components/stats/rankings/InfiniteRankings"
import { Select } from "ui/base/Select"
import { cleanString } from "common/helpers/cleanString"
import { cn } from "common/helpers/classnames"
import {
    createFileRoute,
    stripSearchParams,
    useNavigate,
} from "@tanstack/react-router"
import { globalRankingsAtom, loadAtoms } from "@/effect/atoms"
import {
    globalRankingsSortOptions,
    sortablePlayerPropSchema,
} from "@/lib/routeSchemas"
import { resolvePage } from "@/lib/routeParams"
import { seoTags } from "@components/SEO"
import { useCallback } from "react"
import { z } from "zod"
import type { SortablePlayerProp } from "@/lib/routeSchemas"

export const Route = createFileRoute("/rankings/global/{-$page}")({
    // Sorting changes which column the server orders by, so it belongs in the
    // URL and in the loader dependency list (not in component state).
    validateSearch: z.object({
        sortBy: sortablePlayerPropSchema.catch("xp"),
    }),
    search: {
        middlewares: [
            stripSearchParams<{ sortBy: SortablePlayerProp }>({
                sortBy: "xp",
            }),
        ],
    },
    loaderDeps: ({ search }) => ({ sortBy: search.sortBy }),
    loader: ({ params, deps, context }) =>
        loadAtoms(context, [
            globalRankingsAtom(deps.sortBy, parseInt(resolvePage(params.page))),
        ]),
    head({ params }) {
        const page = resolvePage(params?.page)
        return {
            meta: seoTags({
                title: `Brawlhalla Global Player Rankings - Page ${page} • Corehalla`,
                description: `Brawhalla Global Player Rankings - Page ${page} • Corehalla`,
            }),
        }
    },
    component: Page,
})

function Page() {
    const { page: pageParam } = Route.useParams()
    const { sortBy } = Route.useSearch()
    const navigate = useNavigate()

    const page = parseInt(resolvePage(pageParam), 10)

    const syncPage = useCallback(
        (nextPage: number) => {
            navigate({
                to: "/rankings/global/{-$page}",
                params: { page: nextPage > 1 ? String(nextPage) : undefined },
                search: { sortBy },
                replace: true,
            })
        },
        [navigate, sortBy],
    )

    return (
        <>
            <Select<SortablePlayerProp>
                className="flex-1"
                onChange={(value) =>
                    navigate({
                        to: "/rankings/global/{-$page}",
                        params: { page: pageParam },
                        search: { sortBy: value },
                        replace: true,
                    })
                }
                value={sortBy}
                options={globalRankingsSortOptions}
            />
            <InfiniteRankings
                buildAtom={(pageNumber) =>
                    globalRankingsAtom(sortBy, pageNumber)
                }
                initialPage={page}
                resetKey={`global:${sortBy}`}
                onHighestPageChange={syncPage}
                emptyLabel="No players found"
            >
                {(rows) => (
                    <div className="rounded-lg overflow-hidden border border-bg mb-4 mt-4">
                        {rows.map(
                            ({
                                row: player,
                                index,
                                page: rowPage,
                                positionOnPage,
                            }) => (
                                <div
                                    key={player.id}
                                    className={cn(
                                        "px-4 py-2 w-full h-full flex items-center gap-4 hover:bg-bg",
                                        { "bg-bgVar2": index % 2 === 0 },
                                    )}
                                >
                                    <p className="w-16 h-full flex items-center justify-center text-xs">
                                        {(rowPage - 1) *
                                            GLOBAL_PLAYER_RANKINGS_PER_PAGE +
                                            positionOnPage +
                                            1}
                                    </p>
                                    <p className="flex flex-1 items-center">
                                        <AppLink
                                            href={`/stats/player/${player.id}`}
                                        >
                                            {cleanString(player.name)}
                                        </AppLink>
                                    </p>
                                    <div className="w-40 flex items-center justify-center">
                                        {player.prop}
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                )}
            </InfiniteRankings>
        </>
    )
}
