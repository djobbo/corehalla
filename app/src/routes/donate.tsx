import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/donate")({
    beforeLoad: () => {
        throw redirect({
            href: "https://ko-fi.com/corehalla",
        })
    },
})
