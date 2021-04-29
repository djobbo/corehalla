import styles from '../styles/CodePage.module.scss';
import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { useMapNodesContext } from '../providers/MapNodesProvider';
import { createMapXML } from '../util/createMapXML';
import hljs from 'highlight.js';
import xmlhl from 'highlight.js/lib/languages/xml';
import { MapCanvas } from '../components/MapCanvas';
import { motion } from 'framer-motion';

hljs.registerLanguage('xml', xmlhl);

export default function Code(): JSX.Element {
    const [mapXML, setMapXML] = useState('');
    const { mapData } = useMapNodesContext();

    useEffect(() => {
        setMapXML(hljs.highlight('xml', createMapXML(mapData)).value);
    }, [mapData]);

    return (
        <Layout>
            <motion.div
                className={styles.container}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
            >
                <pre>
                    <code className="hljs" dangerouslySetInnerHTML={{ __html: mapXML }}></code>
                </pre>
            </motion.div>
            <MapCanvas floating />
        </Layout>
    );
}
