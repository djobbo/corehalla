import '../styles/globals.scss'
import '../styles/code.scss'

import type { AppProps } from 'next/app'
import { MapNodesProvider } from '../providers/MapNodesProvider'
import { EditorStateProvider } from '../providers/EditorStateProvider'

import { AnimatePresence, AnimateSharedLayout } from 'framer-motion'

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
