import { createFileRoute, redirect } from "@tanstack/react-router"
import { legacyRedirect } from "@/lib/legacyRedirects"

export const Route = createFileRoute("/donate")({
    beforeLoad() {
        const entry = legacyRedirect("/donate")

        throw redirect({ href: entry.target, statusCode: entry.status })
    },
})
