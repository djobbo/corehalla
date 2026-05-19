import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/kofi")({
    beforeLoad: () => {
        throw redirect({
            href: "https://ko-fi.com/corehalla",
        })
    },
})
