import { createFileRoute, redirect } from "@tanstack/react-router"
import { legacyRedirect } from "@/lib/legacyRedirects"

export const Route = createFileRoute("/twitter")({
    beforeLoad() {
        const entry = legacyRedirect("/twitter")

        throw redirect({ href: entry.target, statusCode: entry.status })
    },
})
