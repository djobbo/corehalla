import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { ClanRankingsView } from "@/components/ClanRankingsView"
import { CLAN_RANKINGS_PAGE_SIZE } from "@/lib/rankings"
import { resolvePage } from "@/lib/routeParams"
import { clansRankingsAtom, preloadAtoms, useQuery } from "@/effect/atoms"

const SEARCH_DEBOUNCE_MS = 300

type GuildSearch = { q: string }

export const Route = createFileRoute("/rankings/guilds/{-$page}")({
    validateSearch: (search: Record<string, unknown>): GuildSearch => ({
        q: typeof search.q === "string" ? search.q : "",
    }),
    loaderDeps: ({ search }) => ({ q: search.q }),
    loader: ({ params, deps, context }) =>
        preloadAtoms(context, [
            clansRankingsAtom(deps.q, resolvePage(params.page)),
        ]),
    component: Page,
})

function Page() {
    const { page: pageParam } = Route.useParams()
    const { q } = Route.useSearch()
    const navigate = useNavigate()

    const page = resolvePage(pageParam)
    const rows = useQuery(clansRankingsAtom(q, page))

    const [typed, setTyped] = useState(q)

    const pushed = useRef(q)

    useEffect(() => {
        if (pushed.current === q) return

        pushed.current = q
        setTyped(q)
    }, [q])

    useEffect(() => {
        if (typed === q) return

        const timer = setTimeout(() => {
            pushed.current = typed

            void navigate({
                to: "/rankings/guilds/{-$page}",
                params: { page: undefined },
                search: { q: typed },
                replace: true,
            })
        }, SEARCH_DEBOUNCE_MS)

        return () => clearTimeout(timer)
    }, [typed, q, navigate])

    const pageHref = (next: number) => {
        const suffix = q === "" ? "" : `?q=${encodeURIComponent(q)}`

        return next > 1
            ? `/rankings/guilds/${next}${suffix}`
            : `/rankings/guilds${suffix}`
    }

    const rankOffset = q === "" ? (page - 1) * CLAN_RANKINGS_PAGE_SIZE : null

    return (
        <main className="ch-page">
            <header className="ch-hero mb-3">
                <p className="ch-kicker">Archive</p>
                <h1 className="ch-display mt-1 text-2xl">Guild rankings</h1>
                <p className="mt-1 text-xs text-muted-foreground">
                    Ordered by XP · page {page}
                </p>
            </header>
            <ClanRankingsView
                rows={rows}
                query={typed}
                onQueryChange={setTyped}
                resultQuery={q}
                rankOffset={rankOffset}
                prevHref={page > 1 ? pageHref(page - 1) : undefined}
                nextHref={
                    rows.length >= CLAN_RANKINGS_PAGE_SIZE
                        ? pageHref(page + 1)
                        : undefined
                }
            />
        </main>
    )
}
