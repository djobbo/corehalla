import { AppLink } from "ui/base/AppLink"
import { Image } from "@components/Image"
import { RankingsLayout } from "@components/stats/rankings/RankingsLayout"
import { RankingsTableItem } from "@components/stats/RankingsTableItem"
import { cleanString } from "common/helpers/cleanString"
import { createFileRoute, stripSearchParams, useNavigate } from "@tanstack/react-router"
import { legendsMap } from "bhapi/legends"
import { loadAtoms, rankings1v1Atom, useQuery } from "@/effect/atoms"
import { rankingsBrackets, rankingsRegions } from "@components/stats/rankings/options"
import { resolvePage, resolveRankedRegion } from "@/lib/routeParams"
import { seoTags } from "@components/SEO"
import { useDebouncedState } from "common/hooks/useDebouncedState"
import { useEffect } from "react"
import { z } from "zod"

export const Route = createFileRoute("/rankings/1v1/{-$region}/{-$page}")({
    // The free-text player filter is part of the URL (and therefore of the
    // loader cache key) instead of a client-only query.
    validateSearch: z.object({
        player: z.string().catch(""),
    }),
    // Keep the default value out of the canonical URL so the server does not
    // redirect `/rankings/1v1` to `/rankings/1v1?player=`.
    search: {
        middlewares: [stripSearchParams<{ player: string }>({ player: "" })],
    },
    loaderDeps: ({ search }) => ({ player: search.player }),
    loader: ({ params, deps, context }) =>
        loadAtoms(context, [
            rankings1v1Atom(
                resolveRankedRegion(params.region),
                parseInt(resolvePage(params.page)),
                deps.player || undefined,
            ),
        ]),
    // Search-result URLs are not canonical content: keep them out of the
    // server-rendered component while still running the loader on the server
    // and serving the (noindex) head.
    ssr: ({ search }) =>
        search.status === "success" && search.value.player
            ? "data-only"
            : true,
    head: ({ params }) => {
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
    const { player } = Route.useSearch()
    const navigate = useNavigate()

    const region = resolveRankedRegion(regionParam)
    const page = resolvePage(pageParam)

    const rankings1v1 = useQuery(
        rankings1v1Atom(region, parseInt(page), player || undefined),
    )

    const [search, setSearch, immediateSearch, isDebouncing] =
        useDebouncedState(player, 500)

    // Mirror the old `history.replaceState` behaviour, but through the router
    // so the loader re-runs and the URL stays shareable.
    useEffect(() => {
        if (isDebouncing || search === player) return

        navigate({
            to: "/rankings/1v1/{-$region}/{-$page}",
            params: { region: regionParam, page: pageParam },
            search: { player: search },
            replace: true,
        })
    }, [search, player, isDebouncing, navigate, regionParam, pageParam])

    return (
        <RankingsLayout
            brackets={rankingsBrackets}
            currentBracket="1v1"
            regions={rankingsRegions}
            currentRegion={region}
            currentPage={page}
            hasPagination={!player}
            hasSearch
            search={immediateSearch}
            setSearch={setSearch}
            searchPlaceholder="Search player..."
            searchSubtitle="Search must start with exact match. Only players that have completed their 10 placement matches are shown."
        >
            <div className="py-4 w-full h-full items-center gap-4 hidden md:flex">
                <p className="w-16 text-center">Rank</p>
                <p className="w-8 text-center">Tier</p>
                <p className="w-16 text-center">Region</p>
                <p className="flex-1">Name</p>
                <p className="w-16 text-center">Games</p>
                <p className="w-32 text-center">W/L</p>
                <p className="w-20 text-center">Winrate</p>
                <p className="w-40 pl-1">Elo</p>
            </div>
            <div className="rounded-lg overflow-hidden border border-bg mb-4 flex flex-col">
                {rankings1v1
                    .filter((player) =>
                        player.name
                            .toLowerCase()
                            .startsWith(immediateSearch.toLowerCase()),
                    )
                    .map((player, i) => {
                        const legend = legendsMap[player.best_legend]

                        return (
                            <RankingsTableItem
                                key={player.brawlhalla_id}
                                index={i}
                                content={
                                    <AppLink
                                        href={`/stats/player/${player.brawlhalla_id}`}
                                        className="flex flex-1 items-center gap-2 md:gap-3"
                                    >
                                        {legend && (
                                            <Image
                                                src={`/images/icons/roster/legends/${legend.legend_name_key}.png`}
                                                alt={legend.bio_name}
                                                containerClassName="w-6 h-6 rounded-lg overflow-hidden"
                                                className="object-cover object-center"
                                            />
                                        )}
                                        {cleanString(player.name)}
                                    </AppLink>
                                }
                                {...player}
                            />
                        )
                    })}
            </div>
        </RankingsLayout>
    )
}
