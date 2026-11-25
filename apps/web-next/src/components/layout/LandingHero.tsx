import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { ladderHref } from "@/lib/rankings"

export const LandingHero = () => (
    <section className="flex flex-col items-start py-12 sm:py-16">
        <h1 className="ch-display text-5xl sm:text-6xl">Corehalla</h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Live leaderboards for every ranked mode and region, in-depth player
            profiles and clan rosters.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
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
