import '../styles/globals.scss';
import '../styles/code.scss';

import type { AppProps } from 'next/app';
import { MapNodesProvider } from '../providers/MapNodesProvider';
import { EditorStateProvider } from '../providers/EditorStateProvider';
import { AnimateSharedLayout } from 'framer-motion';

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<AnimateSharedLayout>
			<EditorStateProvider>
				<MapNodesProvider>
					<Component {...pageProps} />
				</MapNodesProvider>
			</EditorStateProvider>
		</AnimateSharedLayout>
	);
}

export default MyApp;
