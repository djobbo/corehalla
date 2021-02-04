import '../styles/globals.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import type { AppProps } from 'next/app';
import { MapNodesProvider } from '../providers/MapNodesProvider';

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<MapNodesProvider>
			<Component {...pageProps} />;
		</MapNodesProvider>
	);
}

export default MyApp;
