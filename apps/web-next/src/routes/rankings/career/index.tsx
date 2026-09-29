import { createFileRoute, redirect } from "@tanstack/react-router"

/**
 * `/rankings/career` resolves to the players board.
 *
 * The section has three boards and the players one is the default, so it gets
 * the short address while `legends` and `weapons` are named subpaths. A
 * permanent redirect keeps one canonical URL per board rather than two.
 */
export const Route = createFileRoute("/rankings/career/")({
    beforeLoad() {
        throw redirect({ href: "/rankings/career/players", statusCode: 308 })
    },
})
