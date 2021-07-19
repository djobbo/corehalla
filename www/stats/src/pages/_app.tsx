import { AnimatePresence, AnimateSharedLayout } from 'framer-motion'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import '~styles/global.scss'

import { FavoritesProvider } from '~providers/FavoritesProvider'
import { ThemeProvider } from '~providers/ThemeProvider'

import { Loader } from '@Loader'
import { SideNav } from '@SideNav'

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
    const router = useRouter()
    const [pageLoading, setPageLoading] = useState(false)
    useEffect(() => {
        const handleStart = () => {
            setPageLoading(true)
        }
        const handleComplete = () => {
            setPageLoading(false)
        }

        router.events.on('routeChangeStart', handleStart)
        router.events.on('routeChangeComplete', handleComplete)
        router.events.on('routeChangeError', handleComplete)
    }, [router])

    return (
        <>
            <Head>
                <link rel="icon" type="image/png" href="/images/favicon.png" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta property="og:image" content="/images/og/main-og.jpg" />
                <meta name="twitter:image" content="/images/og/main-og.jpg" />
            </Head>

            <ThemeProvider>
                <FavoritesProvider>
                    <AnimateSharedLayout>
                        <div id="App">
                            <div id="Sidenav">
                                <SideNav />
                            </div>
                            <div id="Content">
                                <AnimatePresence exitBeforeEnter initial>
                                    <Component {...pageProps} />
                                </AnimatePresence>
                            </div>
                        </div>
                    </AnimateSharedLayout>
                </FavoritesProvider>
            </ThemeProvider>
            {pageLoading && <Loader />}
        </>
    )
}

export default App
