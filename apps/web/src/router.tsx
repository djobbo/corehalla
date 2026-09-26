import { createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import { ErrorPageContent } from "@components/layout/ErrorPageContent"
import { makeRegistry } from "@/effect/atoms"

export function getRouter() {
    // A fresh registry per server request; a single registry in the browser.
    // `getRouter()` is called once per request by TanStack Start on the server.
    const registry = makeRegistry()

    const router = createRouter({
        routeTree,
        context: { registry },
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
