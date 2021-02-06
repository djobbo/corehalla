import btnStyles from '../styles/Button.module.scss';
import React, { useContext, useState } from 'react';
import useInterval from '../hooks/useInterval';
import { EditorStateContext } from '../providers/EditorStateProvider';
import { MapNodesContext } from '../providers/MapNodesProvider';
import styles from '../styles/PropertiesPanel.module.scss';
import { createMapXML } from '../util/createMapXML';
import { parseMapXML } from '../util/parseMapXML';
import { CollisionSettings } from './CollisionSettings';

export function PropertiesPanel() {
	const { addCollision, mapData, setMapData } = useContext(MapNodesContext);

	const {
		setTheme,
		currentFrame,
		setCurrentFrame,
		showCollisions,
		setShowCollisions,
		showMapBounds,
		setShowMapBounds,
		timeFlow,
		setTimeFlow,
		theme,
	} = useContext(EditorStateContext);

	function getRandomCol(): Collision {
		return {
			id: Math.random().toString(),
			type: 'Hard',
			isDragging: false,
			x1: Math.round(Math.random() * 250 + 250),
			x2: Math.round(Math.random() * 250 + 250),
			y1: Math.round(Math.random() * 250 + 250),
			y2: Math.round(Math.random() * 250 + 250),
		};
	}

	return (
		<div className={styles.container}>
			<CollisionSettings />
			<button
				className={btnStyles.button}
				onClick={() => addCollision(getRandomCol())}
			>
				Add Collision
			</button>
			<button
				className={btnStyles.button}
				onClick={() => console.log(createMapXML(mapData))}
			>
				Generate XML
			</button>
			<input
				type='file'
				name='mapFile'
				onChange={async (e) => {
					if (e.target.files.length <= 0) return;
					const file = e.target.files[0];
					setMapData(parseMapXML(await file.text()));
				}}
			/>
			<select
				onChange={(e) => {
					setTheme(e.target.value);
				}}
			>
				<option value='' selected={theme === ''}>
					None
				</option>
				{mapData.themes.map((th) => (
					<option value={th} key={th} selected={th === theme}>
						{th}
					</option>
				))}
			</select>
			<input
				type='number'
				value={Math.round(currentFrame)}
				onChange={(e) => {
					const f = parseInt(e.target.value);
					setCurrentFrame(f >= 0 ? f : 0);
				}}
			/>
			<input
				type='number'
				value={timeFlow}
				onChange={(e) => {
					const flow = parseInt(e.target.value);
					setTimeFlow(isNaN(flow) ? 0 : flow);
				}}
			/>
			<label>
				Show Collisions
				<input
					type='checkbox'
					checked={showCollisions}
					onChange={(e) => setShowCollisions(e.target.checked)}
				/>
			</label>
			<label>
				Show Map Bounds
				<input
					type='checkbox'
					checked={showMapBounds}
					onChange={(e) => setShowMapBounds(e.target.checked)}
				/>
			</label>
		</div>
	);
}
