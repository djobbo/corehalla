import { createFileRoute, redirect } from "@tanstack/react-router"

const COREHALLA_GITHUB_URL = "https://github.com/djobbo/corehalla"

export const Route = createFileRoute("/github")({
    beforeLoad() {
        throw redirect({ href: COREHALLA_GITHUB_URL, statusCode: 308 })
    },
})
