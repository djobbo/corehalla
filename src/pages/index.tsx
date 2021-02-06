import { MapCanvas } from '../components/MapCanvas';
import { Layout } from '../components/Layout';
import { PropertiesPanel } from '../components/PropertiesPanel';

export default function Home() {
	return (
		<Layout>
			<PropertiesPanel />
			<MapCanvas />
		</Layout>
	);
}
