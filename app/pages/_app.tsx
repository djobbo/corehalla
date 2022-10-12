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
import { Toaster } from "react-hot-toast"
import Head from "next/head"
import type { AppProps } from "next/app"
import type { QueryClientConfig } from "react-query"

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
                            <Toaster />
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
