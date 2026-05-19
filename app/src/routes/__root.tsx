/// <reference types="vite/client" />
import "../../styles/globals.css"
import "../../styles/nprogress.css"
import "@fontsource/montserrat/400.css"
import "@fontsource/montserrat/600.css"
import "@fontsource/montserrat/700.css"
import { BackToTopButton } from "#/components/BackToTopButton"
import { ClientToaster } from "#/components/ClientToaster"
import { Layout } from "#/components/layout/Layout"
import { Searchbox } from "#/components/search/Searchbox"
import { DEFAULT_OG_IMAGE, seoHead } from "#/components/SEO"
import { AuthProvider } from "#/providers/auth/AuthProvider"
import { SideNavProvider } from "#/providers/SideNavProvider"
import {
    HeadContent,
    Outlet,
    Scripts,
    createRootRouteWithContext,
} from "@tanstack/react-router"
import { GAScripts } from "common/analytics/GAScripts"
import { KBarProvider } from "kbar"
import { AnimatedLogo } from "ui/base/AnimatedLogo"
import { PageLoader } from "ui/base/PageLoader"

import type { RouterContext } from "../router-context"

export const Route = createRootRouteWithContext<RouterContext>()({
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            ...seoHead({
                title: "Corehalla",
                image: DEFAULT_OG_IMAGE,
            }).meta,
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
                            <ClientToaster />
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
