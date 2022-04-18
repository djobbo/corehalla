import "../styles/globals.css"
import "@fontsource/montserrat/400.css"
import "@fontsource/montserrat/600.css"
import "@fontsource/montserrat/700.css"

import { FavoritesProvider } from "common/features/favorites/favoritesProvider"
import { KBarProvider } from "kbar"
import { Layout } from "ui/layout/Layout"
import { QueryClient, QueryClientProvider } from "react-query"
import { Searchbox } from "ui/search/Searchbox"
import { globalCss, theme } from "ui/theme"
import Head from "next/head"
import type { AppProps } from "next/app"

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false,
        },
    },
})

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
    globalStyles()

    return (
        <QueryClientProvider client={queryClient}>
            <FavoritesProvider>
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
            </FavoritesProvider>
        </QueryClientProvider>
    )
}

export default MyApp
