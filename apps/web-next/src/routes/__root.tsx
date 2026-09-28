/// <reference types="vite/client" />
import "../styles/app.css"

import {
    ClientOnly,
    HeadContent,
    Link,
    Outlet,
    Scripts,
    createRootRouteWithContext,
    useMatches,
} from "@tanstack/react-router"
import { HydrationBoundary, RegistryContext } from "@effect/atom-react"
import { AccountControl } from "@/components/account/AccountControl"
import { LandingBackground } from "@/components/layout/LandingBackground"
import { MainNav } from "@/components/layout/MainNav"
import { SearchProvider, SearchTrigger } from "@/components/Search"
import { Spinner } from "@/components/ui/spinner"
import { TooltipProvider } from "@/components/ui/tooltip"
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
                 * The tooltip provider wraps everything the app renders, so a
                 * tooltip never has to be paired with its own provider at the
                 * call site — and one provider means one hover-intent delay
                 * across the whole tree rather than one per surface.
                 */}
                <TooltipProvider>
                    {/*
                     * Mounted once, outside every surface: the pattern is page
                     * chrome, not a page's content, so it lives at the root and
                     * nothing else paints a page-wide background over it.
                     */}
                    <LandingBackground className="ch-landing" />
                    {/*
                     * One header for every page, holding the things that must never
                     * move: the way home, the way to search, and the way to each
                     * rankings surface. Home has no hero of its own because this
                     * *is* the compact hero — the ladder then starts immediately
                     * under it.
                     */}
                    <SearchProvider>
                        {/*
                         * The masthead is the poster's title bar: a skewed accent
                         * badge, the wordmark in the display cut, and the search
                         * field as the one wide control.
                         *
                         * It and the nav below are one pinned stack, and the ladder's
                         * own sticky filter row docks under the pair of them — see
                         * `--ch-header-h`. Their heights are shared variables rather
                         * than two numbers that happen to agree.
                         */}
                        <header className="ch-masthead">
                            <Link to="/" className="flex items-center gap-2">
                                <span aria-hidden className="ch-mark">
                                    <span>C</span>
                                </span>
                                <span className="ch-display text-lg tracking-[0.02em]">
                                    Corehalla
                                </span>
                            </Link>
                            <SearchTrigger className="flex-1" />
                            {/*
                             * The account control is client-only: the session is an
                             * `HttpOnly` cookie the server render cannot read, so a
                             * server-rendered answer would only be replaced on
                             * hydration. The placeholder it shows until then is the
                             * one state that is true for both.
                             */}
                            <ClientOnly>
                                <AccountControl />
                            </ClientOnly>
                        </header>
                        <MainNav />
                        <Suspense
                            fallback={
                                /*
                                 * The spinner carries `role="status"` and the
                                 * label, so the text beside it is only the
                                 * visible reassurance — marking it `aria-hidden`
                                 * keeps the name from being announced twice.
                                 */
                                <div className="flex items-center gap-2 p-8 text-muted-foreground">
                                    <Spinner />
                                    <span aria-hidden>Loading…</span>
                                </div>
                            }
                        >
                            <Outlet />
                        </Suspense>
                    </SearchProvider>
                </TooltipProvider>
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
