import { createFileRoute, redirect } from "@tanstack/react-router"
import { legacyRedirect, legacyRedirectHref } from "@/lib/legacyRedirects"

export const Route = createFileRoute("/p/$")({
    beforeLoad({ params }) {
        const entry = legacyRedirect("/p/$")

        throw redirect({
            href: legacyRedirectHref(entry, params._splat),
            statusCode: entry.status,
        })
    },
})
