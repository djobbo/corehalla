import { createFileRoute, redirect } from "@tanstack/react-router"
import { legacyRedirect } from "@/lib/legacyRedirects"

export const Route = createFileRoute("/github")({
    beforeLoad() {
        const entry = legacyRedirect("/github")

        throw redirect({ href: entry.target, statusCode: entry.status })
    },
})
