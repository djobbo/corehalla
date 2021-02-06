import '../styles/globals.scss';
import '../styles/code.scss';

import type { AppProps } from 'next/app';
import { MapNodesProvider } from '../providers/MapNodesProvider';
import { EditorStateProvider } from '../providers/EditorStateProvider';

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<EditorStateProvider>
			<MapNodesProvider>
				<Component {...pageProps} />
			</MapNodesProvider>
		</EditorStateProvider>
	);
}

export default MyApp;
