import { createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import { makeRegistry } from "@/effect/atoms"
import { PageLoaderProbe } from "@/components/layout/PageLoader"

const PENDING_MS = 140

const PENDING_MIN_MS = 480

export function getRouter() {
    // Fresh registry per server request; one shared registry in the browser.
    const registry = makeRegistry()

    const router = createRouter({
        routeTree,
        context: { registry },
        defaultPreload: "intent",
        scrollRestoration: true,
        // Probe, not the overlay: Suspense fallbacks tear down before exit anims.
        defaultPendingComponent: PageLoaderProbe,
        defaultPendingMs: PENDING_MS,
        defaultPendingMinMs: PENDING_MIN_MS,
    })

    return router
}

declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof getRouter>
    }
}
