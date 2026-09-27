import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { ClanRankingsView } from "@/components/ClanRankingsView"
import { CLAN_RANKINGS_PAGE_SIZE } from "@/lib/rankings"
import { resolvePage } from "@/lib/routeParams"
import { clansRankingsAtom, preloadAtoms, useQuery } from "@/effect/atoms"

/**
 * The clan leaderboard.
 *
 * The query lives in the address bar rather than in component state, so a
 * filtered clan list is a link like anything else. That is also why the loader
 * depends on it: `loaderDeps` is what makes a query change re-run the loader
 * instead of only re-rendering.
 *
 * Page numbers are path segments and the query is a search param, which is the
 * shape the legacy app used and the reason `pageHref` below has to rebuild both
 * halves of the URL rather than just one.
 */

/** How long typing pauses before it becomes a request. */
const SEARCH_DEBOUNCE_MS = 300

type ClanSearch = { q: string }

export const Route = createFileRoute("/rankings/clans/{-$page}")({
    // An unparseable query is an empty one. These values are user-editable, and
    // an empty search is a better answer than an error page — the same call
    // `resolveRegion` and `resolvePage` make for the path segments.
    validateSearch: (search: Record<string, unknown>): ClanSearch => ({
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

    /*
     * Records the value *we* last pushed into the URL.
     *
     * It is what tells "the user edited the URL" apart from "we edited the URL
     * to match what the user typed", and without it the adoption below would
     * fight the debounce: every keystroke would eventually navigate, the
     * navigation would come back as `q`, and the effect would write the same
     * value into the input again — harmless here, but it is also what would
     * clobber a half-typed word if the two ever disagreed.
     */
    const pushed = useRef(q)

    // URL -> input. Fires for back/forward and for a shared link, never for our
    // own writes.
    useEffect(() => {
        if (pushed.current === q) return

        pushed.current = q
        setTyped(q)
    }, [q])

    // Input -> URL, debounced. A request per keystroke is the thing this exists
    // to avoid.
    useEffect(() => {
        if (typed === q) return

        const timer = setTimeout(() => {
            pushed.current = typed

            /*
             * Back to page one, always. Page four of the previous search is not
             * page four of this one, and keeping it would page a list the
             * reader never saw the start of.
             */
            void navigate({
                to: "/rankings/clans/{-$page}",
                params: { page: undefined },
                search: { q: typed },
                replace: true,
            })
        }, SEARCH_DEBOUNCE_MS)

        return () => clearTimeout(timer)
    }, [typed, q, navigate])

    /*
     * Built by hand rather than with the router's `Link` params, because the
     * page is a path segment while the query is a search param: a page link has
     * to carry both, and dropping the query would silently reset the search
     * when someone paged through their results.
     */
    const pageHref = (next: number) => {
        const suffix = q === "" ? "" : `?q=${encodeURIComponent(q)}`

        return next > 1
            ? `/rankings/clans/${next}${suffix}`
            : `/rankings/clans${suffix}`
    }

    /*
     * Ranks are offered only for the unfiltered list. A name search returns a
     * prefix match ordered by XP within that match, so row three is the third
     * best match — not the third-best clan in the world. `null` is how the view
     * is told to drop the column rather than print a position the query never
     * computed.
     */
    const rankOffset = q === "" ? (page - 1) * CLAN_RANKINGS_PAGE_SIZE : null

    return (
        <main className="ch-page">
            <header className="ch-hero mb-3">
                <p className="ch-kicker">Archive</p>
                <h1 className="ch-display mt-1 text-2xl">Clan rankings</h1>
                <p className="mt-1 text-xs text-textVar1">
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
