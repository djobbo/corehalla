import { createFileRoute, redirect } from "@tanstack/react-router"
import { legacyRedirect } from "@/lib/legacyRedirects"

export const Route = createFileRoute("/discord")({
    beforeLoad() {
        const entry = legacyRedirect("/discord")

        throw redirect({ href: entry.target, statusCode: entry.status })
    },
})
