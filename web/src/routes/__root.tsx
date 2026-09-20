/// <reference types="vite/client" />
import "../styles/app.css"

import { AnimatedLogo } from "ui/base/AnimatedLogo"
import { AuthProvider } from "@ctx/auth/AuthProvider"
import { BackToTopButton } from "@components/BackToTopButton"
import { ClientOnly } from "@tanstack/react-router"
import { ErrorPageContent } from "@components/layout/ErrorPageContent"
import { GAScripts } from "common/analytics/GAScripts"
import { HeadContent } from "@tanstack/react-router"
import { KBarProvider } from "kbar"
import { Layout } from "@components/layout/Layout"
import { Outlet } from "@tanstack/react-router"
import { PageLoader } from "ui/base/PageLoader"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Scripts } from "@tanstack/react-router"
import { Searchbox } from "@components/search/Searchbox"
import { SideNavProvider } from "@ctx/SideNavProvider"
import { Toaster } from "react-hot-toast"
import { createRootRoute } from "@tanstack/react-router"
import { useState } from "react"
import type { ReactNode } from "react"

export const Route = createRootRoute({
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
    return (
        <RootProviders>
            <Outlet />
        </RootProviders>
    )
}

/**
 * Application-wide providers, moved out of the old `pages/_app.tsx`.
 *
 * The query client is created once per browser session (and once per server
 * request) so user data is never shared between requests.
 */
function RootProviders({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60,
                        refetchOnWindowFocus: false,
                        refetchOnMount: false,
                        retry: 3,
                        retryDelay: (attemptIndex) =>
                            Math.min(1000 * 2 ** attemptIndex, 30000),
                    },
                },
            }),
    )

    return (
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
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
