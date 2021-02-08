import formStyles from '../styles/Forms.module.scss';

import { useContext } from 'react';
import { MapNodesContext } from '../providers/MapNodesProvider';

// Level Metadata Settings
export function LevelMDSettings() {
	const { mapData, setMapData } = useContext(MapNodesContext);

	return (
		<div className={formStyles.formContainer}>
			<label className={formStyles.inlineLabel}>
				Level Name
				<input
					className={formStyles.input}
					type='text'
					value={mapData.levelName}
					onChange={(e) =>
						setMapData((data) => ({
							...data,
							levelName: e.target.value || data.levelName,
						}))
					}
				/>
			</label>
			<label className={formStyles.inlineLabel}>
				Asset Directory
				<input
					className={formStyles.input}
					type='text'
					value={mapData.assetDir}
					onChange={(e) =>
						setMapData((data) => ({
							...data,
							assetDir: e.target.value || data.assetDir,
						}))
					}
				/>
			</label>
			<label className={formStyles.inlineLabel}>
				Background Image
				<input
					className={formStyles.input}
					type='text'
					value={mapData.background}
					onChange={(e) =>
						setMapData((data) => ({
							...data,
							background: e.target.value || data.background,
						}))
					}
				/>
			</label>
		</div>
	);
}
