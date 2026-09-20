import { createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import { ErrorPageContent } from "@components/layout/ErrorPageContent"

export function getRouter() {
    const router = createRouter({
        routeTree,
        defaultPreload: "intent",
        defaultErrorComponent: () => <ErrorPageContent statusCode={500} />,
        scrollRestoration: true,
    })

    return router
}

declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof getRouter>
    }
}
