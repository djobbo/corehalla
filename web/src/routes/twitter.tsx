import { createFileRoute, redirect } from "@tanstack/react-router"

const COREHALLA_TWITTER_URL = "https://twitter.com/Corehalla"

export const Route = createFileRoute("/twitter")({
    beforeLoad: () => {
        throw redirect({ href: COREHALLA_TWITTER_URL, statusCode: 308 })
    },
})
