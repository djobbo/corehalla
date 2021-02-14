import type { AppProps } from 'next/app';
import { AnimatePresence, AnimateSharedLayout } from 'framer-motion';

import '../styles/global.scss';

import { FavoritesProvider } from '@providers/FavoritesProvider';
import { PlayerSearchProvider } from '@providers/PlayerSearchProvider';
import { ThemeProvider } from '@providers/ThemeProvider';

import { ThemeContext, Theme } from '@providers/ThemeProvider';
import { useContext } from 'react';
import Head from 'next/head';

// const GlobalStyle = createGlobalStyle<{ theme: string }>`
//   :root {
//     ${({ theme }) => theme}
//     /* background-image: url('/images/backgrounds/Background.jpg'); */
//   }

//   body {
//       background-color: $bg;
//   }
// `; TODO: Find another way to apply theme (NEXT.JS THEMES)

export default function MyApp({ Component, pageProps }: AppProps) {
	// const { getThemeStr } = useContext(ThemeContext);

	return (
		<>
			<Head>
				<link rel='icon' type='image/png' href='/images/favicon.png' />
			</Head>
			<ThemeProvider>
				<FavoritesProvider>
					<PlayerSearchProvider>
						<AnimateSharedLayout>
							<div id='App'>
								<AnimatePresence exitBeforeEnter initial>
									<Component {...pageProps} />
								</AnimatePresence>
							</div>
						</AnimateSharedLayout>
					</PlayerSearchProvider>
				</FavoritesProvider>
			</ThemeProvider>
		</>
	);
}
