import { createFileRoute, redirect } from "@tanstack/react-router"
import { legacyRedirect } from "@/lib/legacyRedirects"

export const Route = createFileRoute("/kofi")({
    beforeLoad() {
        const entry = legacyRedirect("/kofi")

        throw redirect({ href: entry.target, statusCode: entry.status })
    },
})
