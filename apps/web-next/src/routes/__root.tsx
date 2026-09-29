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
import {
    PageLoader,
    PageLoaderProbe,
    PageLoaderProvider,
} from "@/components/layout/PageLoader"
import { SearchProvider, SearchTrigger } from "@/components/Search"
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

    // Merge every matched route's dehydrated slice before the first client render.
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
                <TooltipProvider>
                    <PageLoaderProvider>
                        <LandingBackground className="ch-landing" />
                        <SearchProvider>
                            <header className="ch-masthead">
                                <Link
                                    to="/"
                                    className="flex items-center gap-2"
                                >
                                    <span aria-hidden className="ch-mark">
                                        <span>C</span>
                                    </span>
                                    <span className="ch-display text-lg tracking-[0.02em]">
                                        Corehalla
                                    </span>
                                </Link>
                                <SearchTrigger className="flex-1" />
                                {/* Session is HttpOnly; server would always paint signed-out. */}
                                <ClientOnly>
                                    <AccountControl />
                                </ClientOnly>
                            </header>
                            <MainNav />
                            <Suspense fallback={<PageLoaderProbe />}>
                                <Outlet />
                            </Suspense>
                        </SearchProvider>
                        <PageLoader />
                    </PageLoaderProvider>
                </TooltipProvider>
            </HydrationBoundary>
        </RegistryContext.Provider>
    )
}

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
