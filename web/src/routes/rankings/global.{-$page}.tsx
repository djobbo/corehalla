import { AppLink } from "ui/base/AppLink"
import { GLOBAL_PLAYER_RANKINGS_PER_PAGE } from "@util/constants"
import { Select } from "ui/base/Select"
import { cleanString } from "common/helpers/cleanString"
import { cn } from "common/helpers/classnames"
import {
    createFileRoute,
    stripSearchParams,
    useNavigate,
} from "@tanstack/react-router"
import { globalRankingsAtom, loadAtoms, useQuery } from "@/effect/atoms"
import {
    globalRankingsSortOptions,
    sortablePlayerPropSchema,
} from "@/lib/routeSchemas"
import { resolvePage } from "@/lib/routeParams"
import { seoTags } from "@components/SEO"
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

    const page = resolvePage(pageParam)
    const players = useQuery(globalRankingsAtom(sortBy, parseInt(page)))

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
            <div className="rounded-lg overflow-hidden border border-bg mb-4">
                {players?.map((player, index) => (
                    <div
                        key={player.id}
                        className={cn(
                            "px-4 py-2 w-full h-full flex items-center gap-4 hover:bg-bg",
                            { "bg-bgVar2": index % 2 === 0 },
                        )}
                    >
                        <p className="w-16 h-full flex items-center justify-center text-xs">
                            {(parseInt(page, 10) - 1) *
                                GLOBAL_PLAYER_RANKINGS_PER_PAGE +
                                index +
                                1}
                        </p>
                        <p className="flex flex-1 items-center">
                            <AppLink href={`/stats/player/${player.id}`}>
                                {cleanString(player.name)}
                            </AppLink>
                        </p>
                        <div className="w-40 flex items-center justify-center">
                            {player.prop}
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
