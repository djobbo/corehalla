import { AppLink } from "ui/base/AppLink"
import { CLANS_RANKINGS_PER_PAGE } from "@util/constants"
import { PaginatedRankings } from "@components/stats/rankings/PaginatedRankings"
import { RankingsLayout } from "@components/stats/rankings/RankingsLayout"
import { cleanString } from "@crh/common/helpers/cleanString"
import { cn } from "@crh/common/helpers/classnames"
import { activeSearchQueryAtom, searchQueryAtom } from "@/effect/searchQuery"
import { clansRankingsAtom, preloadAtoms } from "@/effect/atoms"
import { useAtomSet, useAtomValue } from "@effect/atom-react"
import {
    createFileRoute,
    stripSearchParams,
    useNavigate,
} from "@tanstack/react-router"
import { formatUnixTime } from "@/lib/date"
import { rankingsBrackets } from "@components/stats/rankings/options"
import { resolvePage } from "@/lib/routeParams"
import { seoTags } from "@components/SEO"
import { useEffect, useRef } from "react"
import { useExitSearch } from "@/lib/hooks/useExitSearch"
import { z } from "zod"

export const Route = createFileRoute("/rankings/clans/{-$page}")({
    validateSearch: z.object({
        q: z.string().catch(""),
    }),
    search: {
        middlewares: [stripSearchParams<{ q: string }>({ q: "" })],
    },
    loaderDeps: ({ search }) => ({ q: search.q }),
    loader: ({ params, deps, context }) =>
        preloadAtoms(context, [
            clansRankingsAtom(deps.q, parseInt(resolvePage(params.page))),
        ]),
    ssr: ({ search }) =>
        search.status === "success" && search.value.q ? "data-only" : true,
    head({ params }) {
        const page = resolvePage(params?.page)
        return {
            meta: seoTags({
                title: `Brawlhalla Clans - Page ${page} • Corehalla`,
                description: `Brawhalla Clans - Page ${page} • Corehalla`,
            }),
        }
    },
    component: ClansPage,
})

function ClansPage() {
    const { page: pageParam } = Route.useParams()
    const { q } = Route.useSearch()
    const navigate = useNavigate()
    const exitSearch = useExitSearch()

    const page = parseInt(resolvePage(pageParam), 10)

    const queryInput = useAtomValue(searchQueryAtom)
    const setQueryInput = useAtomSet(searchQueryAtom)
    const activeQuery = useAtomValue(activeSearchQueryAtom)
    // The last value this component pushed into the URL, so an external change
    // (back/forward, a deep link) resets the input without clobbering typing.
    const committed = useRef<string | null>(null)

    useEffect(() => {
        if (committed.current === q) return

        committed.current = q
        setQueryInput(q)
    }, [q, setQueryInput])

    // Only the debounced, long-enough query reaches the URL and the atom.
    useEffect(() => {
        if (activeQuery === q) return

        committed.current = activeQuery
        navigate({
            to: "/rankings/clans/{-$page}",
            params: { page: pageParam },
            search: { q: activeQuery },
            replace: true,
        })
    }, [activeQuery, q, navigate, pageParam])

    const showClanRank = !q
    /**
     * Changing the query resets to page 1, so a page link has to rebuild the
     * whole URL: the page lives in a path segment and the query in `q`.
     */
    const pageHref = (nextPage: number) => {
        const suffix = q ? `?q=${encodeURIComponent(q)}` : ""

        return nextPage > 1
            ? `/rankings/clans/${nextPage}${suffix}`
            : `/rankings/clans${suffix}`
    }

    return (
        <RankingsLayout
            brackets={rankingsBrackets}
            currentBracket="clans"
            regions={null}
            search={{
                value: queryInput,
                onChange: setQueryInput,
                // Esc clears the query first and only leaves search mode
                // once the input is already empty.
                onEscape: () => {
                    if (queryInput) {
                        setQueryInput("")
                        return
                    }
                    exitSearch()
                },
                placeholder: "Search clan by name...",
            }}
            searchQuery={q}
        >
            <PaginatedRankings
                buildAtom={(pageNumber) => clansRankingsAtom(q, pageNumber)}
                page={page}
                pageSize={CLANS_RANKINGS_PER_PAGE}
                resetKey={`clans:${q}`}
                pageHref={pageHref}
                emptyLabel={q ? `No clans match "${q}"` : "No clans found"}
            >
                {(rows) => {
                    // Immediate feedback while the debounced request is pending.
                    const immediate = queryInput.trim().toLowerCase()
                    const visibleRows = immediate
                        ? rows.filter(({ row: clan }) =>
                              cleanString(clan.name)
                                  .toLowerCase()
                                  .startsWith(immediate),
                          )
                        : rows

                    return (
                        <>
                            <div className="p-4 w-full h-full flex items-center gap-4">
                                {showClanRank && (
                                    <p className="w-16 text-center">Rank</p>
                                )}
                                <p className="flex-1">Name</p>
                                <p className="w-40 pl-1 text-center">
                                    Created on
                                </p>
                                <p className="w-20 pl-1 text-center">XP</p>
                            </div>
                            <div className="rounded-lg overflow-hidden border border-bg mb-4">
                                {visibleRows.map(
                                    ({
                                        row: clan,
                                        index,
                                        page: rowPage,
                                        positionOnPage,
                                    }) => (
                                        <div
                                            key={clan.id}
                                            className={cn(
                                                "px-4 py-2 w-full h-full flex items-center gap-4 hover:bg-bg",
                                                {
                                                    "bg-bgVar2":
                                                        index % 2 === 0,
                                                },
                                            )}
                                        >
                                            {showClanRank && (
                                                <p className="w-16 h-full flex items-center justify-center text-xs">
                                                    {(rowPage - 1) *
                                                        CLANS_RANKINGS_PER_PAGE +
                                                        positionOnPage +
                                                        1}
                                                </p>
                                            )}
                                            <p className="flex flex-1 items-center">
                                                <AppLink
                                                    href={`/stats/clan/${clan.id}`}
                                                >
                                                    {cleanString(clan.name)}
                                                </AppLink>
                                            </p>
                                            <div className="w-40 flex items-center justify-center">
                                                {!!clan.created &&
                                                clan.created > 0
                                                    ? formatUnixTime(
                                                          clan.created,
                                                      )
                                                    : "N/A"}
                                            </div>
                                            <p className="w-20 text-center">
                                                {clan.xp}
                                            </p>
                                        </div>
                                    ),
                                )}
                            </div>
                        </>
                    )
                }}
            </PaginatedRankings>
        </RankingsLayout>
    )
}
