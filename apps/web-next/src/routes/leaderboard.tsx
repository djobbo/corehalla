import { createFileRoute, redirect } from "@tanstack/react-router"

/**
 * `/leaderboard` resolves to the live 1v1 ladder.
 *
 * A convenience entry point rather than a page: "the leaderboard" means the 1v1
 * ladder to anyone who types it, and this was a real address in the legacy app,
 * so the one canonical URL is `/rankings/live/1v1` and this only forwards.
 */
export const Route = createFileRoute("/leaderboard")({
    beforeLoad() {
        throw redirect({ href: "/rankings/live/1v1", statusCode: 308 })
    },
})
