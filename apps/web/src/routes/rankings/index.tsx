import { createFileRoute, redirect } from "@tanstack/react-router"

/**
 * `/rankings` and `/leaderboard/*` both permanently resolve to the 1v1
 * rankings, matching the previous `next.config.js` redirects.
 */
export const Route = createFileRoute("/rankings/")({
    beforeLoad() {
        throw redirect({ href: "/rankings/1v1", statusCode: 308 })
    },
})
