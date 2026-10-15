import { createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import { makeRegistry } from "@/effect/atoms"
import { PageLoaderProbe } from "@/components/layout/PageLoader"

/**
 * The full-screen poster is a "this is taking a while" screen, not a transition
 * flourish: ordinary navigations resolve under this and keep the previous page
 * on screen with the top progress bar as the only feedback. A navigation that
 * crosses the threshold is slow enough to justify covering the page.
 */
const PENDING_MS = 1000

// The overlay's own floor (PageLoader `MIN_VISIBLE_MS`) owns the flash guard.
const PENDING_MIN_MS = 0

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
