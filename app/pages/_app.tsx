import "../styles/globals.css"
import "@fontsource/montserrat/400.css"
import "@fontsource/montserrat/600.css"
import "@fontsource/montserrat/700.css"

import { AnimatedLogo } from "ui/base/AnimatedLogo"
import { AuthProvider } from "db/client/AuthProvider"
import { GAScripts } from "common/analytics/GAScripts"
import { Hydrate, QueryClient, QueryClientProvider } from "react-query"
import { KBarProvider } from "kbar"
import { Layout } from "@components/layout/Layout"
import { PageLoader } from "ui/base/PageLoader"
import { SEO } from "@components/SEO"
import { Searchbox } from "@components/search/Searchbox"
import { useRef } from "react"
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

const MyApp = ({ Component, pageProps }: AppProps) => {
    const queryClient = useRef(new QueryClient(queryClientConfig))

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
            <QueryClientProvider client={queryClient.current}>
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

export default MyApp
