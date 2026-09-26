import { AliasesSubtitle } from "@components/search/AliasesSubtitle"
import { AppLink } from "ui/base/AppLink"
import { Atom } from "effect/unstable/reactivity"
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import { Image } from "@components/Image"
import { PaginatedRankings } from "@components/stats/rankings/PaginatedRankings"
import { RANKINGS_1V1_PER_PAGE } from "@util/constants"
import { RankingsLayout } from "@components/stats/rankings/RankingsLayout"
import { RankingsTableItem } from "@components/stats/RankingsTableItem"
import { UserIcon } from "ui/icons"
import { cleanString } from "@crh/common/helpers/cleanString"
import {
    createFileRoute,
    stripSearchParams,
    useNavigate,
} from "@tanstack/react-router"
import { legendsMap } from "@crh/bhapi/legends"
import { preloadAtoms, rankings1v1Atom, searchAliasAtom } from "@/effect/atoms"
import {
    rankingsBrackets,
    rankingsRegions,
} from "@components/stats/rankings/options"
import { resolvePage, resolveRankedRegion } from "@/lib/routeParams"
import { seoTags } from "@components/SEO"
import {
    activeSearchQueryAtom,
    MIN_SEARCH_LENGTH,
    searchQueryAtom,
} from "@/effect/searchQuery"
import { useAtomSet, useAtomValue } from "@effect/atom-react"
import { useEffect, useRef } from "react"
import { useExitSearch } from "@/lib/hooks/useExitSearch"
import { z } from "zod"
import type { AliasSearchResult } from "@/effect/schemas"

/**
 * Resolved stand-in so the alias lookup stays lazy: the atom is only mounted
 * for a query long enough to be worth a request.
 */
const idleAliasesAtom = Atom.make(
    AsyncResult.success([] as readonly AliasSearchResult[]),
)

export const Route = createFileRoute("/rankings/1v1/{-$region}/{-$page}")({
    // The name filter is part of the URL (and therefore of the loader cache
    // key) instead of a client-only query.
    validateSearch: z.object({
        q: z.string().catch(""),
    }),
    // Keep the default value out of the canonical URL so the server does not
    // redirect `/rankings/1v1` to `/rankings/1v1?q=`.
    search: {
        middlewares: [stripSearchParams<{ q: string }>({ q: "" })],
    },
    loaderDeps: ({ search }) => ({ q: search.q }),
    loader: ({ params, deps, context }) =>
        preloadAtoms(context, [
            rankings1v1Atom(
                resolveRankedRegion(params.region),
                parseInt(resolvePage(params.page)),
                deps.q || undefined,
            ),
        ]),
    // Search-result URLs are not canonical content: keep them out of the
    // server-rendered component while still running the loader on the server
    // and serving the (noindex) head.
    ssr: ({ search }) =>
        search.status === "success" && search.value.q ? "data-only" : true,
    head({ params }) {
        const region = resolveRankedRegion(params?.region)
        const page = resolvePage(params?.page)
        const label = region === "all" ? "Global" : region.toUpperCase()
        const suffix = ` - Page ${page}`
        return {
            meta: seoTags({
                title: `Brawlhalla ${label} 1v1 Rankings${suffix} • Corehalla`,
                description: `Brawhalla ${label} 1v1 Rankings${suffix} • Corehalla`,
            }),
        }
    },
    component: Page,
})

function Page() {
    const { region: regionParam, page: pageParam } = Route.useParams()
    const { q } = Route.useSearch()
    const navigate = useNavigate()
    const exitSearch = useExitSearch()

    const region = resolveRankedRegion(regionParam)
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
            to: "/rankings/1v1/{-$region}/{-$page}",
            params: { region: regionParam, page: pageParam },
            search: { q: activeQuery },
            replace: true,
        })
    }, [activeQuery, q, navigate, regionParam, pageParam])

    /**
     * Changing the query resets to page 1, and the page lives in its own path
     * segment after the region, so page links rebuild both segments.
     *
     * The region slot cannot be skipped when a page is present, so pages past 1
     * have to spell out `all` rather than leave it empty — otherwise the page
     * number would land in the region segment.
     */
    const pageHref = (nextPage: number) => {
        const suffix = q ? `?q=${encodeURIComponent(q)}` : ""

        if (nextPage <= 1) {
            const regionSegment =
                regionParam && regionParam !== "all" ? `/${regionParam}` : ""

            return `/rankings/1v1${regionSegment}${suffix}`
        }

        const regionSegment = `/${regionParam ?? "all"}`

        return `/rankings/1v1${regionSegment}/${nextPage}${suffix}`
    }

    const trimmedQuery = activeQuery
    // Both result lists page together: the alias matches are the second half
    // of the same page, so they follow the table's page rather than always
    // showing the first one.
    const aliasesAtom = (
        trimmedQuery.length >= MIN_SEARCH_LENGTH
            ? searchAliasAtom(trimmedQuery, page)
            : idleAliasesAtom
    ) as Atom.Atom<
        AsyncResult.AsyncResult<readonly AliasSearchResult[], unknown>
    >
    const aliasesResult = useAtomValue(aliasesAtom)
    const aliasMatches =
        aliasesResult._tag === "Success" ? aliasesResult.value : []

    return (
        <RankingsLayout
            brackets={rankingsBrackets}
            currentBracket="1v1"
            regions={rankingsRegions}
            currentRegion={region}
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
                placeholder: "Search player by name or Brawlhalla ID...",
            }}
            searchQuery={q}
        >
            <PaginatedRankings
                buildAtom={(pageNumber) =>
                    rankings1v1Atom(region, pageNumber, q || undefined)
                }
                page={page}
                pageSize={RANKINGS_1V1_PER_PAGE}
                resetKey={`1v1:${region}:${q}`}
                pageHref={pageHref}
                emptyLabel={q ? `No players match "${q}"` : "No players found"}
            >
                {(rows) => {
                    // Immediate feedback: narrow what is already loaded by the
                    // raw input while the debounced request is still pending.
                    const immediate = queryInput.trim().toLowerCase()
                    const visibleRows = immediate
                        ? rows.filter(({ row }) =>
                              cleanString(row.name)
                                  .toLowerCase()
                                  .startsWith(immediate),
                          )
                        : rows

                    const rankedIds = new Set(
                        visibleRows.map(({ row }) => String(row.brawlhalla_id)),
                    )
                    // Ranking rows win; aliases only add renamed players that
                    // the name filter cannot see.
                    const aliasOnly = aliasMatches.filter(
                        (alias) => !rankedIds.has(alias.playerId),
                    )

                    return (
                        <>
                            <div className="rounded-lg overflow-hidden border border-bg mb-4 flex flex-col">
                                {visibleRows.map(({ row, index }) => {
                                    const legend = legendsMap[row.best_legend]

                                    return (
                                        <RankingsTableItem
                                            key={row.brawlhalla_id}
                                            index={index}
                                            content={
                                                <AppLink
                                                    href={`/stats/player/${row.brawlhalla_id}`}
                                                    className="flex flex-1 items-center gap-2 md:gap-3"
                                                >
                                                    {legend && (
                                                        <Image
                                                            src={`/images/icons/roster/legends/${legend.legend_name_key}.png`}
                                                            alt={
                                                                legend.bio_name
                                                            }
                                                            containerClassName="w-6 h-6 rounded-lg overflow-hidden"
                                                            className="object-cover object-center"
                                                        />
                                                    )}
                                                    {cleanString(row.name)}
                                                </AppLink>
                                            }
                                            {...row}
                                        />
                                    )
                                })}
                            </div>
                            {aliasOnly.length > 0 && (
                                <div className="rounded-lg overflow-hidden border border-bg mb-4 flex flex-col">
                                    <p className="px-4 py-2 text-xs font-semibold text-textVar1">
                                        Other players with similar names
                                    </p>
                                    {aliasOnly.map((alias) => (
                                        <div
                                            key={alias.playerId}
                                            className="flex items-center gap-3 border-b border-bgVar2 px-4 py-3 last:border-b-0 hover:bg-bg/75"
                                        >
                                            <UserIcon className="h-6 w-6 shrink-0" />
                                            <AppLink
                                                href={`/stats/player/${alias.playerId}`}
                                                className="flex min-w-0 flex-1 flex-col"
                                            >
                                                <span className="truncate">
                                                    {cleanString(
                                                        alias.mainAlias,
                                                    )}
                                                </span>
                                                {alias.otherAliases.length >
                                                    0 && (
                                                    <span className="truncate text-xs text-textVar1">
                                                        <AliasesSubtitle
                                                            immediateSearch={
                                                                trimmedQuery
                                                            }
                                                            aliases={
                                                                alias.otherAliases
                                                            }
                                                        />
                                                    </span>
                                                )}
                                            </AppLink>
                                            <span className="shrink-0 rounded-full bg-bg px-2 py-0.5 text-xs text-textVar1">
                                                alias match
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )
                }}
            </PaginatedRankings>
        </RankingsLayout>
    )
}
