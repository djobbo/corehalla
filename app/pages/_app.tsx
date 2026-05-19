import "../styles/globals.css"
import "../styles/nprogress.css"
import "@fontsource/montserrat/400.css"
import "@fontsource/montserrat/600.css"
import "@fontsource/montserrat/700.css"

import { AnimatedLogo } from "ui/base/AnimatedLogo"
import { AuthProvider } from "@ctx/auth/AuthProvider"
// dynamic breaks with next >= v13.0.7
//Will be fixed (maybe?) by https://github.com/vercel/next.js/pull/44832
const BackToTopButton = dynamic(
    () =>
        import("@components/BackToTopButton").then(
            (mod) => mod.BackToTopButton,
        ),
    {
        ssr: false,
    },
)
import { GAScripts } from "common/analytics/GAScripts"
import { KBarProvider } from "kbar"
import { Layout } from "@components/layout/Layout"
import { PageLoader } from "ui/base/PageLoader"
import { Searchbox } from "@components/search/Searchbox"
import { SideNavProvider } from "@ctx/SideNavProvider"
import { ClientToaster } from "@components/ClientToaster"
import { trpc } from "@util/trpc"
import Head from "next/head"
import dynamic from "next/dynamic"
import type { AppProps } from "next/app"

const App = ({
    Component,
    pageProps,
}: AppProps<{ dehydratedState: unknown }>) => {
    return (
        <>
            <Head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" type="image/png" href="/images/favicon.png" />
            </Head>
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
                            <Component {...pageProps} />
                        </Layout>
                        <Searchbox />
                        <BackToTopButton />
                    </SideNavProvider>
                </KBarProvider>
            </AuthProvider>
        </>
    )
}

export default trpc.withTRPC(App)
