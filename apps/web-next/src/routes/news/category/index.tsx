import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/news/category/")({
    beforeLoad() {
        throw redirect({ href: "/news", statusCode: 308 })
    },
})
