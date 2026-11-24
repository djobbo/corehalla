import { createFileRoute, redirect } from "@tanstack/react-router"
import { legacyRedirect, legacyRedirectHref } from "@/lib/legacyRedirects"

export const Route = createFileRoute("/c/$")({
    beforeLoad({ params }) {
        const entry = legacyRedirect("/c/$")

        throw redirect({
            href: legacyRedirectHref(entry, params._splat),
            statusCode: entry.status,
        })
    },
})
