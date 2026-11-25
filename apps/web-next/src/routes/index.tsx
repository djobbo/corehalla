import { ClientOnly, createFileRoute } from "@tanstack/react-router"
import { useAtomValue } from "@effect/atom-react"
import { LandingFavorites } from "@/components/account/LandingFavorites"
import { CommunityCard } from "@/components/landing/CommunityCard"
import { LandingLegends } from "@/components/landing/LandingLegends"
import { TopGuilds } from "@/components/landing/TopGuilds"
import { PageLoaderProbe } from "@/components/layout/PageLoader"
import { LandingHero } from "@/components/layout/LandingHero"
import { LatestNews } from "@/components/news/LatestNews"
import { LandingLadder } from "@/components/views/LandingLadder"
import { WeeklyRotation } from "@/components/views/WeeklyRotation"
import { to1v1Rows, to2v2Rows } from "@/lib/ladderRows"
import {
    clansRankingsAtom,
    landingGuildsAtom,
    legendMetaAtom,
    legendMetaQueryAtom,
    newsArticlesAtom,
    preloadAtomsDegraded,
    rankings1v1Atom,
    rankings1v1QueryAtom,
    rankings2v2Atom,
    rankings2v2QueryAtom,
    useQuery,
    weeklyRotationAtom,
    weeklyRotationLegendsAtom,
} from "@/effect/atoms"

const LANDING_NEWS_COUNT = 3

export const Route = createFileRoute("/")({
    head: () => ({
        meta: [
            {
                title: "Corehalla — Brawlhalla stats, rankings and clans",
            },
            {
                name: "description",
                content:
                    "Live Brawlhalla leaderboards, in-depth player statistics and clan rosters — every ranked mode, every region.",
            },
        ],
    }),
    loader: ({ context }) =>
        preloadAtomsDegraded(
            context,
            [
                rankings1v1QueryAtom("all", 1),
                rankings2v2QueryAtom("all", 1),
                newsArticlesAtom("", 1, LANDING_NEWS_COUNT),
            ],
            // Decoration: they may fail without degrading the page.
            [
                weeklyRotationAtom(),
                legendMetaQueryAtom("all"),
                legendMetaQueryAtom("2200"),
                clansRankingsAtom("", 1),
            ],
        ),
    component: Page,
})

function PageContent() {
    const oneVone = to1v1Rows(useQuery(rankings1v1Atom("all", 1)))
    const twoVtwo = to2v2Rows(useQuery(rankings2v2Atom("all", 1)))
    const { articles } = useQuery(newsArticlesAtom("", 1, LANDING_NEWS_COUNT))
    const rotation = useAtomValue(weeklyRotationLegendsAtom)
    const legendMeta = useAtomValue(legendMetaAtom("all"))
    const metaLegendMeta = useAtomValue(legendMetaAtom("2200"))
    const guilds = useAtomValue(landingGuildsAtom)

    return (
        <main id="main" tabIndex={-1} className="ch-page">
            <LandingHero />
            <WeeklyRotation rotation={rotation} />
            <LandingFavorites />
            <section aria-labelledby="live-rankings">
                <p id="live-rankings" className="ch-kicker mt-8">
                    Live rankings
                </p>
                <div className="mt-2 grid gap-6 lg:grid-cols-3">
                    <LandingLadder bracket="1v1" rows={oneVone} />
                    <LandingLadder bracket="2v2" rows={twoVtwo} />
                    <TopGuilds board={guilds} />
                </div>
            </section>
            <LandingLegends
                board={legendMeta}
                floor="all"
                title="Most played legends"
                titleId="landing-legends"
            />
            <LandingLegends
                board={metaLegendMeta}
                floor="2200"
                title="Meta legends"
                titleId="landing-meta-legends"
            />
            <LatestNews articles={articles} />
            <CommunityCard />
        </main>
    )
}

const LandingShell = () => (
    <main id="main" tabIndex={-1} className="ch-page">
        <PageLoaderProbe />
    </main>
)

function Page() {
    const { degraded } = Route.useLoaderData()

    if (degraded) {
        return (
            <ClientOnly fallback={<LandingShell />}>
                <PageContent />
            </ClientOnly>
        )
    }

    return <PageContent />
}
