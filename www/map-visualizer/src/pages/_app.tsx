import '../styles/globals.scss'
import '../styles/code.scss'

import { AnimatePresence, AnimateSharedLayout } from 'framer-motion'
import type { AppProps } from 'next/app'

import { EditorStateProvider } from '../providers/EditorStateProvider'
import { MapNodesProvider } from '../providers/MapNodesProvider'

function MyApp({ Component, pageProps, router }: AppProps): JSX.Element {
    return (
        <AnimateSharedLayout>
            <EditorStateProvider>
                <MapNodesProvider>
                    <AnimatePresence exitBeforeEnter>
                        <Component {...pageProps} key={router.route} />
                    </AnimatePresence>
                </MapNodesProvider>
            </EditorStateProvider>
        </AnimateSharedLayout>
    )
}

export default MyApp
