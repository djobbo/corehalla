import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/twitter")({
    beforeLoad: () => {
        throw redirect({
            href: "https://twitter.com/Corehalla",
        })
    },
})
