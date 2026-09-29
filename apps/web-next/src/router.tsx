import { createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import { makeRegistry } from "@/effect/atoms"
import { PageLoaderProbe } from "@/components/layout/PageLoader"

/** How long a client-side load may run before the page loader takes over. */
const PENDING_MS = 140

/** The shortest time the loader stays up once shown. Matches its enter animation. */
const PENDING_MIN_MS = 480

export function getRouter() {
    // A fresh registry per server request; a single registry in the browser.
    // `getRouter()` is called once per request by TanStack Start on the server.
    const registry = makeRegistry()

    const router = createRouter({
        routeTree,
        context: { registry },
        // Preload a route's data on link intent, so the data is usually
        // already in the registry by the time a click lands. Hover previews
        // lean on this directly: the card warms the entry the destination
        // then renders from.
        defaultPreload: "intent",
        scrollRestoration: true,
        /*
         * The page loader. Route loaders await their data, so the router knows
         * when a navigation is waiting and can substitute this component for the
         * match that has not arrived yet — see `PageLoader.tsx` for why the
         * loading UI is a probe rather than the loader itself.
         *
         * Without a `pendingComponent` the router cannot show pending UI at all:
         * React keeps the previous page on screen while a transition's data
         * streams in, so a route that is still loading is simply the old page.
         */
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
