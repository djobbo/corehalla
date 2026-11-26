import { Link } from "@tanstack/react-router"
import { SearchTrigger } from "@/components/layout/Search"
import { Button } from "@/components/ui/button"
import { ladderHref } from "@/lib/rankings"

export const LandingHero = () => (
    <section className="flex flex-col items-start py-10 sm:py-16">
        <p className="ch-kicker">Brawlhalla stats</p>
        <h1 className="ch-display mt-2 text-4xl sm:text-6xl">Corehalla</h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Live leaderboards for every ranked mode and region, in-depth player
            profiles and clan rosters.
        </p>
        <SearchTrigger className="mt-7 w-full max-w-xl px-4 py-3.5 text-base" />
        <div className="mt-5 flex flex-wrap gap-2">
            <Button
                size="lg"
                nativeButton={false}
                render={<Link to={ladderHref("1v1", "all")} />}
            >
                Browse the leaderboards
            </Button>
            <Button
                size="lg"
                variant="secondary"
                nativeButton={false}
                render={<Link to="/daily" />}
            >
                Play the daily legend
            </Button>
        </div>
    </section>
)
