import { createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import { makeRegistry } from "@/effect/atoms"

export function getRouter() {
    // A fresh registry per server request; a single registry in the browser.
    // `getRouter()` is called once per request by TanStack Start on the server.
    const registry = makeRegistry()

    const router = createRouter({
        routeTree,
        context: { registry },
        // Preload a route's data on link intent, which is what makes the
        // overlay and hover cards feel immediate: the data is usually already
        // in the registry by the time the click lands.
        defaultPreload: "intent",
        scrollRestoration: true,
    })

    return router
}

declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof getRouter>
    }
}
