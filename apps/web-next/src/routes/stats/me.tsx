import { createFileRoute, redirect } from "@tanstack/react-router"
import { legacyRedirect } from "@/lib/legacyRedirects"

export const Route = createFileRoute("/stats/me")({
    beforeLoad() {
        const entry = legacyRedirect("/stats/me")

        throw redirect({ href: entry.target, statusCode: entry.status })
    },
})
