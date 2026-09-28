import { createFileRoute } from "@tanstack/react-router"
import { LandingHero } from "@/components/layout/LandingHero"
import { LandingLadder } from "@/components/LandingLadder"
import { to1v1Rows, to2v2Rows } from "@/lib/ladderRows"
import {
    preloadAtoms,
    rankings1v1Atom,
    rankings2v2Atom,
    useQuery,
} from "@/effect/atoms"

/**
 * The landing page.
 *
 * A hero you can act on, then a taste of the ladder. The split is the whole
 * design: the hero answers "what is this and how do I search it", and the tables
 * answer "is this thing alive" — which a rank table does better than any amount
 * of copy, because it is the product itself rather than a claim about it.
 *
 * Two ladders, side by side once there is room. 1v1 is the mode most people
 * mean by "rankings", so it leads; 2v2 is the other one v1 actually serves, and
 * putting it alongside costs a column instead of a click. Below `lg` they stack,
 * because a ladder table split much narrower than half of this page starts
 * wrapping team names onto two lines and stops reading as a table at all.
 */

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
    /*
     * Both ladders in one loader, so the two columns commit together. Deferred
     * separately, whichever arrived second would push a reflow through the row
     * it shares with the first.
     */
    loader: ({ context }) =>
        preloadAtoms(context, [
            rankings1v1Atom("all", 1),
            rankings2v2Atom("all", 1),
        ]),
    component: Page,
})

function Page() {
    const oneVone = to1v1Rows(useQuery(rankings1v1Atom("all", 1)))
    const twoVtwo = to2v2Rows(useQuery(rankings2v2Atom("all", 1)))

    return (
        <main className="ch-page">
            <LandingHero />

            {/*
             * Named by the kicker rather than an `sr-only` heading: the kicker
             * already is the section's label, so pointing `aria-labelledby` at
             * it gives the landmark a name without adding a heading that would
             * double it in the outline.
             */}
            <section aria-labelledby="live-rankings">
                <p id="live-rankings" className="ch-kicker mt-8">
                    Live rankings
                </p>

                <div className="mt-2 grid gap-6 lg:grid-cols-2">
                    <LandingLadder bracket="1v1" rows={oneVone} />
                    <LandingLadder bracket="2v2" rows={twoVtwo} />
                </div>
            </section>
        </main>
    )
}
