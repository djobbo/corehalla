import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/stats/me")({
    beforeLoad: () => {
        throw redirect({ to: "/" })
    },
})
