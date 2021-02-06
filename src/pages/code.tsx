import styles from '../styles/CodePage.module.scss';
import { useContext, useEffect, useRef, useState } from 'react';
import { Layout } from '../components/Layout';
import { MapNodesContext } from '../providers/MapNodesProvider';
import { createMapXML } from '../util/createMapXML';
import hljs from 'highlight.js';
import xmlhl from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('xml', xmlhl);

export default function Code() {
	const [mapXML, setMapXML] = useState('');
	const { mapData } = useContext(MapNodesContext);

	useEffect(() => {
		setMapXML(hljs.highlight('xml', createMapXML(mapData)).value);
	}, [mapData]);

	return (
		<Layout>
			<div className={styles.container}>
				<pre>
					<code dangerouslySetInnerHTML={{ __html: mapXML }}></code>
				</pre>
			</div>
		</Layout>
	);
}
