import { Link } from "@tanstack/react-router"
import { SearchTrigger } from "@/components/Search"
import { ladderHref } from "@/lib/rankings"

/**
 * The landing hero.
 *
 * Modelled on the legacy app's harness composer — the mark, the wordmark, a
 * line of orientation, and the search field as the one obvious thing to do —
 * but built from this app's parts rather than as a second design. The field is
 * the same `ch-field` the masthead wears and opens the same overlay; it is just
 * sized up to carry the page, and the buttons under it are the same `ch-btn`
 * the ladder uses for its page controls.
 *
 * Deliberately not an opaque plate. `LandingBackground` is painted page-wide at
 * the top of the viewport and masked out further down, so the art is strongest
 * exactly where a solid band would cover it. The type sits *on* the art
 * instead, which is what makes this read as a poster rather than as one more
 * panel.
 *
 * Centred, which is the one place this app breaks its ranged-left rule. Every
 * other header begins flush left because it is a page you are reading; this one
 * is a doorway, and a doorway is symmetric.
 */
export const LandingHero = () => (
    <section className="flex flex-col items-center px-2 py-10 text-center sm:py-16">
        <span aria-hidden className="ch-mark h-14 w-14 text-2xl">
            <span>C</span>
        </span>

        <p className="ch-kicker mt-5">Brawlhalla stats</p>

        <h1 className="ch-display mt-2 text-4xl sm:text-6xl">Corehalla</h1>

        <p className="mt-4 max-w-xl text-sm text-textVar1 sm:text-base">
            Live leaderboards for every ranked mode and region, in-depth player
            profiles and clan rosters.
        </p>

        {/*
         * A button, not an input: the overlay owns the actual field, so a real
         * input here would be a second source of truth for the query. This is
         * the same component the masthead renders, only larger — the two open
         * the same search, so there is nothing to keep in sync.
         */}
        <SearchTrigger className="mt-7 w-full max-w-xl px-4 py-3.5 text-base" />

        <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link to={ladderHref("1v1", "all")} className="ch-btn px-4 py-2.5">
                Browse the leaderboards
            </Link>
        </div>
    </section>
)
