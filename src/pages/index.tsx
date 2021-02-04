import { useContext } from 'react';
import { CollisionSettings } from '../components/CollisionSettings';
import { MapCanvas } from '../components/MapCanvas';
import { MapNodesContext } from '../providers/MapNodesProvider';
import Button from 'react-bootstrap/Button';
import { createMapXML } from '../util/createMapXML';
import { parseMapXML } from '../util/parseMapXML';

export default function Home() {
	const { addCollision, collisions, setCollisions } = useContext(
		MapNodesContext
	);

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
		<div>
			<Button onClick={() => addCollision(getRandomCol())}>
				Add Collision
			</Button>
			<Button onClick={() => console.log(createMapXML(collisions))}>
				Generate XML
			</Button>
			<input
				type='file'
				name='mapFile'
				onChange={async (e) => {
					if (e.target.files.length <= 0) return;
					const file = e.target.files[0];
					setCollisions(parseMapXML(await file.text()));
				}}
			/>
			<CollisionSettings />
			<MapCanvas />
		</div>
	);
}
