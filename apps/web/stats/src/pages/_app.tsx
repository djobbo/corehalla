import type { AppProps } from 'next/app';
import { AnimatePresence, AnimateSharedLayout } from 'framer-motion';

import '~styles/global.scss';

import { FavoritesProvider } from '~providers/FavoritesProvider';
import { PlayerSearchProvider } from '~providers/PlayerSearchProvider';
import { ThemeProvider } from '~providers/ThemeProvider';

import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Loader } from '@Loader';
import { SideNavProvider } from '~providers/SideNavProvider';

// Router.events.on('routeChangeStart', (url) => {
// 	console.log(`Loading: ${url}`);
// 	NProgress.start();
// });
// Router.events.on('routeChangeComplete', () => NProgress.done());
// Router.events.on('routeChangeError', () => NProgress.done());

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
    // const { getThemeStr } = useContext(ThemeContext);

    const router = useRouter();
    const [pageLoading, setPageLoading] = useState(false);
    useEffect(() => {
        const handleStart = () => {
            setPageLoading(true);
        };
        const handleComplete = () => {
            setPageLoading(false);
        };

        router.events.on('routeChangeStart', handleStart);
        router.events.on('routeChangeComplete', handleComplete);
        router.events.on('routeChangeError', handleComplete);
    }, [router]);

    useEffect(() => {
        console.log(pageLoading);
    }, [pageLoading]);

    return (
        <>
            <Head>
                <link rel="icon" type="image/png" href="/images/favicon.png" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            {/* <Background /> */}

            <ThemeProvider>
                <FavoritesProvider>
                    <PlayerSearchProvider>
                        <SideNavProvider>
                            <AnimateSharedLayout>
                                <div id="App">
                                    <AnimatePresence exitBeforeEnter initial>
                                        <Component {...pageProps} />
                                    </AnimatePresence>
                                </div>
                            </AnimateSharedLayout>
                        </SideNavProvider>
                    </PlayerSearchProvider>
                </FavoritesProvider>
            </ThemeProvider>
            {pageLoading && <Loader />}
        </>
    );
}
