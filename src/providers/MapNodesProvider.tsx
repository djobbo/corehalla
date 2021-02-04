import React, {
	createContext,
	useState,
	PropsWithChildren,
	Dispatch,
	useEffect,
} from 'react';

const defaultMapData: MapData = {
	assetDir: 'Brawlhaven',
	background: 'BG_Brawlhaven.jpg',
	levelName: 'Brawlhaven',
	cameraBounds: { x: -1000, y: -1000, w: -1000, h: -1000 },
	spawnBotBounds: { x: -1000, y: -1000, w: -1000, h: -1000 },
	collisions: [],
	platforms: [],
	spawns: [],
};

export const MapNodesContext = createContext<{
	mapData: MapData;
	setMapData: Dispatch<React.SetStateAction<MapData>>;
	addCollision: (col: Collision) => void;
	selectedCollision?: Collision;
	selectCollision: (id: string) => void;
	updateCollision: (
		id: string,
		col: (c: Collision) => Partial<Collision>
	) => void;
	deselectCollision: () => void;
}>({
	mapData: defaultMapData,
	setMapData: () => {},
	addCollision: () => {},
	selectedCollision: undefined,
	selectCollision: () => {},
	updateCollision: () => {},
	deselectCollision: () => {},
});

interface Props {}

export function MapNodesProvider({ children }: PropsWithChildren<Props>) {
	const [mapData, setMapData] = useState<MapData>(defaultMapData);

	const [selectedCollision, setSelectedCollision] = useState<
		Collision | undefined
	>(undefined);

	const addCollision = (col: Collision) =>
		setMapData((mapData) => ({
			...mapData,
			collisions: [...mapData.collisions, col],
		}));

	const selectCollision = (id: string) => {
		setSelectedCollision(mapData.collisions.find((col) => col.id === id));
	};

	const updateCollision = (
		id: string,
		col: (c: Collision) => Partial<Collision>
	) => {
		setMapData((mapData) => ({
			...mapData,
			collisions: mapData.collisions.map((c) =>
				c.id === id ? { ...c, ...col(c) } : c
			),
		}));
	};

	const deselectCollision = () => {
		setSelectedCollision(null);
	};

	useEffect(() => {
		if (!selectedCollision) return;
		setSelectedCollision(
			mapData.collisions.find((col) => col.id === selectedCollision.id)
		);
	}, [mapData.collisions]);

	return (
		<MapNodesContext.Provider
			value={{
				mapData,
				setMapData,
				addCollision,
				selectedCollision,
				selectCollision,
				updateCollision,
				deselectCollision,
			}}
		>
			{children}
		</MapNodesContext.Provider>
	);
}
