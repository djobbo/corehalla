import { createFileRoute, redirect } from "@tanstack/react-router"
import { legacyRedirect } from "@/lib/legacyRedirects"

export const Route = createFileRoute("/wiki")({
    beforeLoad() {
        const entry = legacyRedirect("/wiki")

        throw redirect({ href: entry.target, statusCode: entry.status })
    },
})
