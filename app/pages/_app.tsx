import "../styles/globals.css"
import "../styles/nprogress.css"
import "@fontsource/montserrat/400.css"
import "@fontsource/montserrat/600.css"
import "@fontsource/montserrat/700.css"
import { SEO } from "@components/SEO"
import { trpc } from "@util/trpc"
import Head from "next/head"
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
            <SEO title="Corehalla" image="/images/og/main-og.jpg" />
            <Component {...pageProps} />
        </>
    )
}

export default trpc.withTRPC(App)
