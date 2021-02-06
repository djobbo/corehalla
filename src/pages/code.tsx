import { useContext, useEffect, useRef, useState } from 'react';
import { Layout } from '../components/Layout';
import { MapNodesContext } from '../providers/MapNodesProvider';
import { createMapXML } from '../util/createMapXML';
import hljs from 'highlight.js';
import xmlhl from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/darcula.css';

hljs.registerLanguage('xml', xmlhl);

export default function Code() {
	const [mapXML, setMapXML] = useState('');
	const { mapData } = useContext(MapNodesContext);

	useEffect(() => {
		setMapXML(hljs.highlight('xml', createMapXML(mapData)).value);
	}, [mapData]);

	return (
		<Layout>
			<pre>
				<code
					className='xml hljs'
					dangerouslySetInnerHTML={{ __html: mapXML }}
				></code>
			</pre>
		</Layout>
	);
}
