import "../styles/globals.css"
import "@fontsource/montserrat/400.css"
import "@fontsource/montserrat/600.css"
import "@fontsource/montserrat/700.css"

import { AuthProvider } from "db/client/AuthProvider"
import { Hydrate, QueryClient, QueryClientProvider } from "react-query"
import { KBarProvider } from "kbar"
import { Layout } from "ui/layout/Layout"
import { Searchbox } from "ui/search/Searchbox"
import { globalCss, theme } from "ui/theme"
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
export const globalStyles = globalCss({
    "html, body": {
        backgroundColor: theme.colors.blue1,
        color: theme.colors.blue12,
        fontFamily: '"Montserrat", sans-serif',
    },

    // Scrollbars
    "::-webkit-scrollbar": {
        width: "0.5rem",
    },
    "::-webkit-scrollbar-track": {
        background: "transparent",
    },
    "::-webkit-scrollbar-thumb": {
        background: theme.colors.blue8,
        borderRadius: "0.5rem",
    },
    "::-webkit-scrollbar-thumb:hover": {
        background: theme.colors.blue9,
    },
})

const MyApp = ({ Component, pageProps }: AppProps) => {
    const queryClient = useRef(new QueryClient(queryClientConfig))
    globalStyles()

    return (
        <QueryClientProvider client={queryClient.current}>
            <Hydrate state={pageProps.dehydratedState}>
                <AuthProvider>
                    {/* @ts-expect-error kbar is weird */}
                    <KBarProvider actions={[]} options={{}}>
                        <Layout>
                            <Head>
                                <title>Corehalla</title>
                            </Head>
                            <Component {...pageProps} />
                        </Layout>
                        <Searchbox />
                    </KBarProvider>
                </AuthProvider>
            </Hydrate>
        </QueryClientProvider>
    )
}

export default MyApp
