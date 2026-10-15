import { createFileRoute } from "@tanstack/react-router"
import { LandingHero } from "@/components/layout/LandingHero"
import { LandingLadder } from "@/components/views/LandingLadder"
import { LatestNews } from "@/components/news/LatestNews"
import { to1v1Rows, to2v2Rows } from "@/lib/ladderRows"
import {
    newsArticlesAtom,
    preloadAtoms,
    rankings1v1Atom,
    rankings2v2Atom,
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
        preloadAtoms(context, [
            rankings1v1Atom("all", 1),
            rankings2v2Atom("all", 1),
            newsArticlesAtom("", 1, LANDING_NEWS_COUNT),
        ]),
    component: Page,
})

function Page() {
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
