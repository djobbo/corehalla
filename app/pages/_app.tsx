import "../styles/globals.css"
import "../styles/nprogress.css"
import "@fontsource/montserrat/400.css"
import "@fontsource/montserrat/600.css"
import "@fontsource/montserrat/700.css"

import { AnimatedLogo } from "ui/base/AnimatedLogo"
import { AuthProvider } from "@ctx/auth/AuthProvider"
import { GAScripts } from "common/analytics/GAScripts"
import { Hydrate, QueryClient, QueryClientProvider } from "react-query"
import { KBarProvider } from "kbar"
import { Layout } from "@components/layout/Layout"
import { PageLoader } from "ui/base/PageLoader"
import { SEO } from "@components/SEO"
import { Searchbox } from "@components/search/Searchbox"
import { useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import NProgress from "nprogress"
import type { AppProps } from "next/app"
import type { QueryClientConfig } from "react-query"

NProgress.configure({ showSpinner: false })

const queryClientConfig: QueryClientConfig = {
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false,
        },
    },
}

const queryClient = new QueryClient(queryClientConfig)

const App = ({
    Component,
    pageProps,
}: AppProps<{ dehydratedState: unknown }>) => {
    const router = useRouter()

    useEffect(() => {
        const handleRouteStart = () => NProgress.start()
        const handleRouteDone = () => NProgress.done()

        router.events.on("routeChangeStart", handleRouteStart)
        router.events.on("routeChangeComplete", handleRouteDone)
        router.events.on("routeChangeError", handleRouteDone)

        return () => {
            router.events.off("routeChangeStart", handleRouteStart)
            router.events.off("routeChangeComplete", handleRouteDone)
            router.events.off("routeChangeError", handleRouteDone)
        }
    }, [])

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
            <SEO title="Corehalla" image="/images/og/main-og.jpg" />
            <GAScripts />
            <QueryClientProvider client={queryClient}>
                <Hydrate state={pageProps.dehydratedState}>
                    <AuthProvider>
                        <KBarProvider actions={[]} options={{}}>
                            <PageLoader>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm">Loading...</span>
                                    <AnimatedLogo size={32} />
                                </div>
                            </PageLoader>
                            <Layout>
                                <Component {...pageProps} />
                            </Layout>
                            <Searchbox />
                        </KBarProvider>
                    </AuthProvider>
                </Hydrate>
            </QueryClientProvider>
        </>
    )
}

export default App
