/// <reference types="vite/client" />
import "../styles/app.css"

import {
    HeadContent,
    Link,
    Outlet,
    Scripts,
    createRootRouteWithContext,
    useMatches,
} from "@tanstack/react-router"
import { HydrationBoundary, RegistryContext } from "@effect/atom-react"
import { HoverPreviewLayer } from "@/components/HoverPreview"
import { SearchProvider, SearchTrigger } from "@/components/Search"
import { Suspense, useMemo } from "react"
import type { ReactNode } from "react"
import type { DehydratedState, RouterContext } from "@/effect/atoms"

export const Route = createRootRouteWithContext<RouterContext>()({
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            { title: "Corehalla" },
        ],
    }),
    component: RootComponent,
    shellComponent: RootDocument,
})

function RootComponent() {
    const { registry } = Route.useRouteContext()
    const matches = useMatches()

    // Route loaders preload their atoms and return the dehydrated state. Merging
    // every matched route's slice lets `HydrationBoundary` restore the
    // server-computed values before the first client render.
    const dehydrated = useMemo(
        () =>
            matches.flatMap(
                (match) =>
                    (
                        match.loaderData as
                            | { dehydrated?: DehydratedState }
                            | undefined
                    )?.dehydrated ?? [],
            ),
        [matches],
    )

    return (
        <RegistryContext.Provider value={registry}>
            <HydrationBoundary state={dehydrated}>
                {/*
                 * One header for every page, holding the two things that must
                 * never move: the way home and the way to search. Home has no
                 * hero of its own because this *is* the compact hero — the
                 * ladder then starts immediately under it.
                 */}
                <SearchProvider>
                    <header className="flex items-center gap-3 border-b border-bg px-4 py-2">
                        <Link to="/" className="font-bold">
                            Corehalla
                        </Link>
                        <SearchTrigger className="flex-1" />
                    </header>
                    <Suspense
                        fallback={
                            <div className="p-8 text-textVar1">Loading…</div>
                        }
                    >
                        <Outlet />
                    </Suspense>
                    {/*
                     * Outside the `Suspense` above on purpose. A preview is not
                     * part of the page, so it must not be torn down when the
                     * route it was raised from suspends — and it reads its atoms
                     * without suspending, so it never needs a fallback of its own.
                     */}
                    <HoverPreviewLayer />
                </SearchProvider>
            </HydrationBoundary>
        </RegistryContext.Provider>
    )
}

/** The full HTML document shell — always server rendered. */
function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body>
                {children}
                <Scripts />
            </body>
        </html>
    )
}
