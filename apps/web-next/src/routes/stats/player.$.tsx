import { createFileRoute, redirect } from "@tanstack/react-router"

/**
 * The old address of a player profile.
 *
 * The collection is `players` now — the singular `/stats/player/123` was the
 * odd one out beside `/stats/guilds/123`. Everything after the id is a tab
 * segment, so the whole remainder is carried across as a splat rather than
 * enumerated here.
 */

export const Route = createFileRoute("/stats/player/$")({
    beforeLoad({ params }) {
        throw redirect({
            href: `/stats/players/${params._splat ?? ""}`,
            statusCode: 308,
        })
    },
})
