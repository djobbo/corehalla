import { createFileRoute, redirect } from "@tanstack/react-router"

/**
 * `/rankings` resolves to the 1v1 ladder.
 *
 * A permanent redirect rather than a hub page, matching the legacy app: the nav
 * already links each surface directly, so an index would be a page you only ever
 * arrive at by accident and then immediately leave. The redirect means the
 * accident costs nothing, and there is one canonical URL for the 1v1 ladder
 * rather than two that have to be kept in step.
 */
export const Route = createFileRoute("/rankings/")({
    beforeLoad() {
        throw redirect({ href: "/rankings/1v1", statusCode: 308 })
    },
})
