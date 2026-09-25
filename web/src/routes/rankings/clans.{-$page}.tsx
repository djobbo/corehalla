import { AppLink } from "ui/base/AppLink"
import { CLANS_RANKINGS_PER_PAGE } from "@util/constants"
import { InfiniteRankings } from "@components/stats/rankings/InfiniteRankings"
import { RankingsLayout } from "@components/stats/rankings/RankingsLayout"
import { cleanString } from "common/helpers/cleanString"
import { cn } from "common/helpers/classnames"
import { clansRankingsAtom, loadAtoms } from "@/effect/atoms"
import {
    createFileRoute,
    stripSearchParams,
    useNavigate,
} from "@tanstack/react-router"
import { formatUnixTime } from "common/helpers/date"
import { rankingsBrackets } from "@components/stats/rankings/options"
import { resolvePage } from "@/lib/routeParams"
import { seoTags } from "@components/SEO"
import { useCallback, useEffect, useRef } from "react"
import { useDebouncedState } from "common/hooks/useDebouncedState"
import { useExitSearch } from "common/hooks/useExitSearch"
import { z } from "zod"

const SEARCH_DEBOUNCE_MS = 400

export const Route = createFileRoute("/rankings/clans/{-$page}")({
    validateSearch: z.object({
        q: z.string().catch(""),
    }),
    search: {
        middlewares: [stripSearchParams<{ q: string }>({ q: "" })],
    },
    loaderDeps: ({ search }) => ({ q: search.q }),
    loader: ({ params, deps, context }) =>
        loadAtoms(context, [
            clansRankingsAtom(deps.q, parseInt(resolvePage(params.page))),
        ]),
    ssr: ({ search }) => (search.status === "success" && search.value.q ? "data-only" : true),
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

    const [search, setSearch, immediateSearch, isDebouncing] = useDebouncedState(
        q,
        SEARCH_DEBOUNCE_MS,
    )
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
            to: "/rankings/clans/{-$page}",
            params: { page: pageParam },
            search: { q: search },
            replace: true,
        })
    }, [search, q, isDebouncing, navigate, pageParam])

    const syncPage = useCallback(
        (nextPage: number) => {
            navigate({
                to: "/rankings/clans/{-$page}",
                params: { page: nextPage > 1 ? String(nextPage) : undefined },
                search: { q },
                replace: true,
            })
        },
        [navigate, q],
    )

    const showClanRank = !q

    return (
        <RankingsLayout
            brackets={rankingsBrackets}
            currentBracket="clans"
            regions={null}
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
                placeholder: "Search clans by name...",
            }}
            searchQuery={q}
        >
            <InfiniteRankings
                buildAtom={(pageNumber) => clansRankingsAtom(q, pageNumber)}
                initialPage={page}
                resetKey={`clans:${q}`}
                onHighestPageChange={syncPage}
                emptyLabel={q ? `No clans match "${q}"` : "No clans found"}
            >
                {(rows) => (
                    <>
                        <div className="p-4 w-full h-full flex items-center gap-4">
                            {showClanRank && (
                                <p className="w-16 text-center">Rank</p>
                            )}
                            <p className="flex-1">Name</p>
                            <p className="w-40 pl-1 text-center">Created on</p>
                            <p className="w-20 pl-1 text-center">XP</p>
                        </div>
                        <div className="rounded-lg overflow-hidden border border-bg mb-4">
                            {rows.map(({ row: clan, index, page: rowPage, positionOnPage }) => (
                                <div
                                    key={clan.id}
                                    className={cn(
                                        "px-4 py-2 w-full h-full flex items-center gap-4 hover:bg-bg",
                                        { "bg-bgVar2": index % 2 === 0 },
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
                                        {!!clan.created && clan.created > 0
                                            ? formatUnixTime(clan.created)
                                            : "N/A"}
                                    </div>
                                    <p className="w-20 text-center">
                                        {clan.xp}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </InfiniteRankings>
        </RankingsLayout>
    )
}
