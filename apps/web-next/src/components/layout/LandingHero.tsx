import { Link } from "@tanstack/react-router"
import { SearchTrigger } from "@/components/layout/Search"
import { Button } from "@/components/ui/button"
import { ladderHref } from "@/lib/rankings"

export const LandingHero = () => (
    <section className="flex flex-col items-center px-2 py-10 text-center sm:py-16">
        <span aria-hidden className="ch-mark h-14 w-14 text-2xl">
            <span>C</span>
        </span>
        <p className="ch-kicker mt-5">Brawlhalla stats</p>
        <h1 className="ch-display mt-2 text-4xl sm:text-6xl">Corehalla</h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Live leaderboards for every ranked mode and region, in-depth player
            profiles and clan rosters.
        </p>
        <SearchTrigger className="mt-7 w-full max-w-xl px-4 py-3.5 text-base" />
        <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button
                size="lg"
                nativeButton={false}
                render={<Link to={ladderHref("1v1", "all")} />}
            >
                Browse the leaderboards
            </Button>
        </div>
    </section>
)
