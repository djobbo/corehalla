import { createFileRoute, redirect } from "@tanstack/react-router"

const COREHALLA_KOFI_URL = "https://ko-fi.com/corehalla"

export const Route = createFileRoute("/donate")({
    beforeLoad() {
        throw redirect({ href: COREHALLA_KOFI_URL, statusCode: 308 })
    },
})
