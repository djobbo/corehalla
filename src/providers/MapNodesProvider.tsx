import React, {
	createContext,
	useState,
	PropsWithChildren,
	Dispatch,
	useEffect,
} from 'react';

const initialCollisions: Collision[] = [
	{
		id: '1',
		type: 'Hard',
		x1: 500,
		y1: 500,
		x2: 100,
		y2: 250,
		isDragging: false,
	},
];

export const MapNodesContext = createContext<{
	collisions: Collision[];
	setCollisions: Dispatch<React.SetStateAction<Collision[]>>;
	addCollision: (col: Collision) => void;
	selectedCollision?: Collision;
	selectCollision: (id: string) => void;
	updateCollision: (id: string, col: Partial<Collision>) => void;
}>({
	collisions: [],
	setCollisions: () => {},
	addCollision: () => {},
	selectedCollision: undefined,
	selectCollision: () => {},
	updateCollision: () => {},
});

interface Props {}

export function MapNodesProvider({ children }: PropsWithChildren<Props>) {
	const [collisions, setCollisions] = useState<Collision[]>(
		initialCollisions
	);

	const [selectedCollision, setSelectedCollision] = useState<
		Collision | undefined
	>(undefined);

	const addCollision = (col: Collision) =>
		setCollisions((cols) => [...cols, col]);

	const selectCollision = (id: string) => {
		setSelectedCollision(collisions.find((col) => col.id === id));
	};

	const updateCollision = (id: string, col: Partial<Collision>) => {
		setCollisions((cols) =>
			cols.map((c) => (c.id === id ? { ...c, ...col } : c))
		);
	};

	useEffect(() => {
		if (!selectedCollision) return;
		setSelectedCollision(
			collisions.find((col) => col.id === selectedCollision.id)
		);
	}, [collisions]);

	return (
		<MapNodesContext.Provider
			value={{
				collisions,
				setCollisions,
				addCollision,
				selectedCollision,
				selectCollision,
				updateCollision,
			}}
		>
			{children}
		</MapNodesContext.Provider>
	);
}
