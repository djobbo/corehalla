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
import { cmsMediaManifestAtom, preloadAtoms } from "@/effect/atoms"
import { AccountControl } from "@/components/account/AccountControl"
import { AlertBar } from "@/components/layout/AlertBar"
import { NotFoundPage } from "@/components/layout/ErrorPage"
import { Footer } from "@/components/layout/Footer"
import { LandingBackground } from "@/components/layout/LandingBackground"
import { MainNav } from "@/components/layout/MainNav"
import { NavigationProgress } from "@/components/layout/NavigationProgress"
import {
    PageLoader,
    PageLoaderProbe,
    PageLoaderProvider,
} from "@/components/layout/PageLoader"
import { SearchProvider, SearchTrigger } from "@/components/layout/Search"
import { TooltipProvider } from "@/components/ui/tooltip"
import { errorPageFor, notFoundPage } from "@/lib/errorPage"
import { Suspense, useMemo } from "react"
import type { ReactNode } from "react"
import type { DehydratedState, RouterContext } from "@/effect/atoms"

/**
 * The slice of the route match this route's head reads. It is spelled out
 * because the contextual `matches` type resolves through the registered router,
 * which points back at this route and collapses the loader data otherwise.
 */
type RootHeadContext = {
    readonly matches: ReadonlyArray<{
        readonly _notFound?: boolean
        readonly status: "pending" | "success" | "error" | "notFound"
        readonly error?: unknown
    }>
}

export const Route = createRootRouteWithContext<RouterContext>()({
    head({ matches }: RootHeadContext) {
        const failure = matches.find(
            (match) => match._notFound === true || match.status === "error",
        )

        const page =
            failure === undefined
                ? undefined
                : failure.status === "error"
                  ? errorPageFor(failure.error)
                  : notFoundPage

        return {
            meta: [
                { charSet: "utf-8" },
                {
                    name: "viewport",
                    content: "width=device-width, initial-scale=1",
                },
                ...(page?.meta ?? [{ title: "Corehalla" }]),
            ],
        }
    },
    loader: async ({ context }) => ({
        ...(await preloadAtoms(context, [cmsMediaManifestAtom()])),
        // Read once per load, so a render either side of New Year cannot move it.
        year: new Date().getFullYear(),
    }),
    component: RootComponent,
    shellComponent: RootDocument,
    notFoundComponent: NotFoundPage,
})

function RootComponent() {
    const { registry } = Route.useRouteContext()
    const { year } = Route.useLoaderData()
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
                            <AlertBar />
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
                            <Footer year={year} />
                        </SearchProvider>
                        <NavigationProgress />
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
