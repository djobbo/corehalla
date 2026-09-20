import { AppLink } from "ui/base/AppLink"
import { CLANS_RANKINGS_PER_PAGE } from "@util/constants"
import { RankingsLayout } from "@components/stats/rankings/RankingsLayout"
import { cleanString } from "common/helpers/cleanString"
import { cn } from "common/helpers/classnames"
import { clansRankingsAtom, loadAtoms, useQuery } from "@/effect/atoms"
import { createFileRoute, stripSearchParams, useNavigate } from "@tanstack/react-router"
import { formatUnixTime } from "common/helpers/date"
import { rankingsBrackets } from "@components/stats/rankings/options"
import { resolvePage } from "@/lib/routeParams"
import { seoTags } from "@components/SEO"
import { useDebouncedState } from "common/hooks/useDebouncedState"
import { useEffect } from "react"
import { z } from "zod"

export const Route = createFileRoute("/rankings/clans/{-$page}")({
    validateSearch: z.object({
        clan: z.string().catch(""),
    }),
    search: {
        middlewares: [stripSearchParams<{ clan: string }>({ clan: "" })],
    },
    loaderDeps: ({ search }) => ({ clan: search.clan }),
    loader: ({ params, deps, context }) =>
        loadAtoms(context, [
            clansRankingsAtom(deps.clan, parseInt(resolvePage(params.page))),
        ]),
    ssr: ({ search }) =>
        search.status === "success" && search.value.clan ? "data-only" : true,
    head: ({ params }) => {
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
    const { clan } = Route.useSearch()
    const navigate = useNavigate()

    const page = resolvePage(pageParam)
    const clans = useQuery(clansRankingsAtom(clan, parseInt(page)))

    const [search, setSearch, immediateSearch, isDebouncing] =
        useDebouncedState(clan, 500)

    useEffect(() => {
        if (isDebouncing || search === clan) return

        navigate({
            to: "/rankings/clans/{-$page}",
            params: { page: pageParam },
            search: { clan: search },
            replace: true,
        })
    }, [search, clan, isDebouncing, navigate, pageParam])

    const showClanRank = !clan

    return (
        <RankingsLayout
            brackets={rankingsBrackets}
            currentBracket="clans"
            regions={null}
            currentPage={page}
            hasPagination={!clan}
            hasSearch
            search={immediateSearch}
            setSearch={setSearch}
            searchPlaceholder="Search clan..."
            searchSubtitle="Search by clan name (exactly as it appears in-game). Clan search/rankings is still in early development."
        >
            <div className="p-4 w-full h-full flex items-center gap-4">
                {showClanRank && <p className="w-16 text-center">Rank</p>}
                <p className="flex-1">Name</p>
                <p className="w-40 pl-1 text-center">Created on</p>
                <p className="w-20 pl-1 text-center">XP</p>
            </div>
            <div className="rounded-lg overflow-hidden border border-bg mb-4">
                {clans.map((clan, index) => (
                    <div
                        key={clan.id}
                        className={cn(
                            "px-4 py-2 w-full h-full flex items-center gap-4 hover:bg-bg",
                            { "bg-bgVar2": index % 2 === 0 },
                        )}
                    >
                        {showClanRank && (
                            <p className="w-16 h-full flex items-center justify-center text-xs">
                                {(parseInt(page, 10) - 1) *
                                    CLANS_RANKINGS_PER_PAGE +
                                    index +
                                    1}
                            </p>
                        )}
                        <p className="flex flex-1 items-center">
                            <AppLink href={`/stats/clan/${clan.id}`}>
                                {cleanString(clan.name)}
                            </AppLink>
                        </p>
                        <div className="w-40 flex items-center justify-center">
                            {!!clan.created && clan.created > 0
                                ? formatUnixTime(clan.created)
                                : "N/A"}
                        </div>
                        <p className="w-20 text-center">{clan.xp}</p>
                    </div>
                ))}
            </div>
        </RankingsLayout>
    )
}
