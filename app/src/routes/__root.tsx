/// <reference types="vite/client" />
import "../../styles/globals.css"
import "../../styles/nprogress.css"
import "@fontsource/montserrat/400.css"
import "@fontsource/montserrat/600.css"
import "@fontsource/montserrat/700.css"

import { AnimatedLogo } from "ui/base/AnimatedLogo"
import { AuthProvider } from "@ctx/auth/AuthProvider"
import { BackToTopButton } from "@components/BackToTopButton"
import { GAScripts } from "common/analytics/GAScripts"
import { KBarProvider } from "kbar"
import { Layout } from "@components/layout/Layout"
import { PageLoader } from "ui/base/PageLoader"
import { SEO } from "@components/SEO"
import { Searchbox } from "@components/search/Searchbox"
import { SideNavProvider } from "@ctx/SideNavProvider"
import {
    HeadContent,
    Outlet,
    Scripts,
    createRootRoute,
} from "@tanstack/react-router"
import { Toaster } from "react-hot-toast"

export const Route = createRootRoute({
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
        ],
        links: [
            {
                rel: "icon",
                type: "image/png",
                href: "/images/favicon.png",
            },
        ],
    }),
    shellComponent: RootDocument,
})

function RootDocument() {
    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body>
                <SEO title="Corehalla" image="/images/og/main-og.jpg" />
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
                            <Layout>
                                <Outlet />
                            </Layout>
                            <Searchbox />
                            <BackToTopButton />
                        </SideNavProvider>
                    </KBarProvider>
                </AuthProvider>
                <Scripts />
            </body>
        </html>
    )
}
