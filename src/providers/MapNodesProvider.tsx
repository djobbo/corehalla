import React, {
	createContext,
	useState,
	PropsWithChildren,
	Dispatch,
	useEffect,
} from 'react';

export const MapNodesContext = createContext<{
	collisions: Collision[];
	setCollisions: Dispatch<React.SetStateAction<Collision[]>>;
	addCollision: (col: Collision) => void;
	selectedCollision?: Collision;
	selectCollision: (id: string) => void;
	updateCollision: (id: string, col: Partial<Collision>) => void;
	deselectCollision: () => void;
}>({
	collisions: [],
	setCollisions: () => {},
	addCollision: () => {},
	selectedCollision: undefined,
	selectCollision: () => {},
	updateCollision: () => {},
	deselectCollision: () => {},
});

interface Props {}

export function MapNodesProvider({ children }: PropsWithChildren<Props>) {
	const [collisions, setCollisions] = useState<Collision[]>([]);

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

	const deselectCollision = () => {
		setSelectedCollision(null);
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
				deselectCollision,
			}}
		>
			{children}
		</MapNodesContext.Provider>
	);
}
