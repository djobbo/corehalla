import { useContext, useEffect, useState } from 'react';
import { CollisionSettings } from '../components/CollisionSettings';
import { MapCanvas } from '../components/MapCanvas';
import { MapNodesContext } from '../providers/MapNodesProvider';
import { createMapXML } from '../util/createMapXML';
import { parseMapXML } from '../util/parseMapXML';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import useInterval from '../hooks/useInterval';

export default function Home() {
	const {
		addCollision,
		mapData,
		setMapData,
		setTheme,
		currentFrame,
		setCurrentFrame,
		showCollisions,
		setShowCollisions,
		showMapBounds,
		setShowMapBounds,
	} = useContext(MapNodesContext);

	const [timeFlow, setTimeFlow] = useState(0);

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

	// useEffect(() => {
	// 	setInterval(() => {
	// 		setCurrentFrame((frame) => frame + 1);
	// 	}, (1 * 1000) / 60);
	// }, []);

	useInterval(
		() => {
			setCurrentFrame((frame) => frame + timeFlow / 60);
		},
		timeFlow === 0 ? null : 1000 / 60
	);

	return (
		<Layout>
			<div className='w-80 absolute top-0 left-0 bottom-0 z-50 bg-gray-100'>
				<CollisionSettings />
				<div className='flex flex-col'>
					<Button onClick={() => addCollision(getRandomCol())}>
						Add Collision
					</Button>
					<Button onClick={() => console.log(createMapXML(mapData))}>
						Generate XML
					</Button>
				</div>
				<input
					className='mx-2'
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
					<option value=''>None</option>
					{mapData.themes.map((theme) => (
						<option value={theme} key={theme}>
							{theme}
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
			<MapCanvas />
		</Layout>
	);
}
