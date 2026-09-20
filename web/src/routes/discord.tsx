import { createFileRoute, redirect } from "@tanstack/react-router"

const COREHALLA_DISCORD_URL = "https://discord.com/invite/eD248ez"

export const Route = createFileRoute("/discord")({
    beforeLoad: () => {
        throw redirect({ href: COREHALLA_DISCORD_URL, statusCode: 308 })
    },
})
