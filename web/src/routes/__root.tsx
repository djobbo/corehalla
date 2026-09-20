/// <reference types="vite/client" />
import "../styles/app.css"

import { AnimatedLogo } from "ui/base/AnimatedLogo"
import { AuthProvider } from "@ctx/auth/AuthProvider"
import { BackToTopButton } from "@components/BackToTopButton"
import {
    ClientOnly,
    HeadContent,
    Outlet,
    Scripts,
    createRootRouteWithContext,
    useMatches,
} from "@tanstack/react-router"
import { ErrorPageContent } from "@components/layout/ErrorPageContent"
import { GAScripts } from "common/analytics/GAScripts"
import { HydrationBoundary, RegistryContext } from "@effect/atom-react"
import { KBarProvider } from "kbar"
import { Layout } from "@components/layout/Layout"
import { PageLoader } from "ui/base/PageLoader"
import { Searchbox } from "@components/search/Searchbox"
import { SideNavProvider } from "@ctx/SideNavProvider"
import { Spinner } from "ui/base/Spinner"
import { Suspense, useMemo } from "react"
import { Toaster } from "react-hot-toast"
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
        links: [
            { rel: "icon", type: "image/png", href: "/images/favicon.png" },
        ],
    }),
    component: RootComponent,
    shellComponent: RootDocument,
    notFoundComponent: () => (
        <ErrorPageContent title="Page not found" statusCode={404} />
    ),
    errorComponent: () => <ErrorPageContent statusCode={500} />,
})

function RootComponent() {
    const { registry } = Route.useRouteContext()
    const matches = useMatches()

    // Route loaders preload their atoms and return the dehydrated state.
    // Merging every matched route's slice lets `HydrationBoundary` restore the
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
                <RootProviders>
                    <Suspense
                        fallback={
                            <div className="flex items-center justify-center h-48">
                                <Spinner size="4rem" />
                            </div>
                        }
                    >
                        <Outlet />
                    </Suspense>
                </RootProviders>
            </HydrationBoundary>
        </RegistryContext.Provider>
    )
}

/**
 * Application-wide providers, moved out of the old `pages/_app.tsx`.
 *
 * Server data is owned by Effect atoms (see `src/effect`), so there is no
 * Query client here.
 */
function RootProviders({ children }: { children: ReactNode }) {
    return (
        <>
            <GAScripts />
            <AuthProvider>
                <KBarProvider actions={[]} options={{}}>
                    <SideNavProvider>
                        <PageLoader>
                            <div className="flex items-center gap-4">
                                <span className="text-sm">Loading...</span>
                                <AnimatedLogo size={32} />
                            </div>
                        </PageLoader>
                        <Toaster />
                        <Layout>{children}</Layout>
                        <Searchbox />
                        <ClientOnly>
                            <BackToTopButton />
                        </ClientOnly>
                    </SideNavProvider>
                </KBarProvider>
            </AuthProvider>
        </>
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
