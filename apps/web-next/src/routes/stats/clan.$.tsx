import { createFileRoute, redirect } from "@tanstack/react-router"

/**
 * The old address of a guild page.
 *
 * Clans are guilds now, so the public URL is `/stats/guilds/123`. The code and
 * the database still say clan — this redirect is the one place the old name
 * survives, purely for backwards compatibility with indexed links.
 */

export const Route = createFileRoute("/stats/clan/$")({
    beforeLoad({ params }) {
        throw redirect({
            href: `/stats/guilds/${params._splat ?? ""}`,
            statusCode: 308,
        })
    },
})
