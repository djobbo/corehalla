import { ClientOnly, createFileRoute } from "@tanstack/react-router"
import { PageLoaderProbe } from "@/components/layout/PageLoader"
import { LandingHero } from "@/components/layout/LandingHero"
import { LandingLadder } from "@/components/views/LandingLadder"
import { LatestNews } from "@/components/news/LatestNews"
import { to1v1Rows, to2v2Rows } from "@/lib/ladderRows"
import {
    newsArticlesAtom,
    preloadAtomsDegraded,
    rankings1v1Atom,
    rankings1v1QueryAtom,
    rankings2v2Atom,
    rankings2v2QueryAtom,
    useQuery,
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
        preloadAtomsDegraded(context, [
            rankings1v1QueryAtom("all", 1),
            rankings2v2QueryAtom("all", 1),
            newsArticlesAtom("", 1, LANDING_NEWS_COUNT),
        ]),
    component: Page,
})

function PageContent() {
    const oneVone = to1v1Rows(useQuery(rankings1v1Atom("all", 1)))
    const twoVtwo = to2v2Rows(useQuery(rankings2v2Atom("all", 1)))
    const { articles } = useQuery(newsArticlesAtom("", 1, LANDING_NEWS_COUNT))

    return (
        <main className="ch-page">
            <LandingHero />
            <section aria-labelledby="live-rankings">
                <p id="live-rankings" className="ch-kicker mt-8">
                    Live rankings
                </p>
                <div className="mt-2 grid gap-6 lg:grid-cols-2">
                    <LandingLadder bracket="1v1" rows={oneVone} />
                    <LandingLadder bracket="2v2" rows={twoVtwo} />
                </div>
            </section>
            <LatestNews articles={articles} />
        </main>
    )
}

const LandingShell = () => (
    <main className="ch-page">
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
