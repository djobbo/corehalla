import { AliasesSubtitle } from "@components/search/AliasesSubtitle"
import { AppLink } from "ui/base/AppLink"
import { Atom } from "effect/unstable/reactivity"
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import { Image } from "@components/Image"
import { InfiniteRankings } from "@components/stats/rankings/InfiniteRankings"
import { RankingsLayout } from "@components/stats/rankings/RankingsLayout"
import { RankingsTableItem } from "@components/stats/RankingsTableItem"
import { UserIcon } from "ui/icons"
import { cleanString } from "common/helpers/cleanString"
import {
    createFileRoute,
    stripSearchParams,
    useNavigate,
} from "@tanstack/react-router"
import { legendsMap } from "bhapi/legends"
import { loadAtoms, rankings1v1Atom, searchAliasAtom } from "@/effect/atoms"
import {
    rankingsBrackets,
    rankingsRegions,
} from "@components/stats/rankings/options"
import { resolvePage, resolveRankedRegion } from "@/lib/routeParams"
import { seoTags } from "@components/SEO"
import { useAtomValue } from "@effect/atom-react"
import { useCallback, useEffect, useRef } from "react"
import { useDebouncedState } from "common/hooks/useDebouncedState"
import { useExitSearch } from "common/hooks/useExitSearch"
import { z } from "zod"
import type { AliasSearchResult } from "@/effect/schemas"

const SEARCH_DEBOUNCE_MS = 400

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
        loadAtoms(context, [
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

    const [search, setSearch, immediateSearch, isDebouncing] =
        useDebouncedState(q, SEARCH_DEBOUNCE_MS)
    // The last value this component pushed into the URL, so that an external
    // change (back/forward) resets the input without clobbering in-flight
    // typing.
    const committed = useRef(q)

    useEffect(() => {
        if (committed.current === q) return

        committed.current = q
        setSearch(q)
    }, [q, setSearch])

    useEffect(() => {
        if (isDebouncing || search === q) return

        committed.current = search
        navigate({
            to: "/rankings/1v1/{-$region}/{-$page}",
            params: { region: regionParam, page: pageParam },
            search: { q: search },
            replace: true,
        })
    }, [search, q, isDebouncing, navigate, regionParam, pageParam])

    // Follow the table as it grows; page 1 stays out of the URL.
    const syncPage = useCallback(
        (nextPage: number) => {
            navigate({
                to: "/rankings/1v1/{-$region}/{-$page}",
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
                search: { q },
                replace: true,
            })
        },
        [navigate, regionParam, q],
    )

    const trimmedQuery = q.trim()
    const aliasesAtom = (
        trimmedQuery.length >= 2
            ? searchAliasAtom(trimmedQuery, 1)
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
                value: immediateSearch,
                onChange: setSearch,
                // Esc clears the query first and only leaves search mode
                // once the input is already empty.
                onEscape: () => {
                    if (immediateSearch) {
                        setSearch("")
                        return
                    }
                    exitSearch()
                },
                placeholder: "Search player by name or Brawlhalla ID...",
            }}
            searchQuery={q}
        >
            <InfiniteRankings
                buildAtom={(pageNumber) =>
                    rankings1v1Atom(region, pageNumber, q || undefined)
                }
                initialPage={page}
                resetKey={`1v1:${region}:${q}`}
                onHighestPageChange={syncPage}
                emptyLabel={q ? `No players match "${q}"` : "No players found"}
            >
                {(rows) => {
                    const rankedIds = new Set(
                        rows.map(({ row }) => String(row.brawlhalla_id)),
                    )
                    // Ranking rows win; aliases only add renamed players that
                    // the name filter cannot see.
                    const aliasOnly = aliasMatches.filter(
                        (alias) => !rankedIds.has(alias.playerId),
                    )

                    return (
                        <>
                            <div className="rounded-lg overflow-hidden border border-bg mb-4 flex flex-col">
                                {rows.map(({ row, index }) => {
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
            </InfiniteRankings>
        </RankingsLayout>
    )
}
