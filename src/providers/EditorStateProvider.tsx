import React, {
	createContext,
	useState,
	PropsWithChildren,
	Dispatch,
} from 'react';

export const EditorStateContext = createContext<{
	theme: string;
	setTheme: Dispatch<React.SetStateAction<string>>;
	currentFrame: number;
	setCurrentFrame: Dispatch<React.SetStateAction<number>>;
	showCollisions: boolean;
	setShowCollisions: Dispatch<React.SetStateAction<boolean>>;
	showMapBounds: boolean;
	setShowMapBounds: Dispatch<React.SetStateAction<boolean>>;
}>({
	theme: '',
	setTheme: () => {},
	currentFrame: 0,
	setCurrentFrame: () => {},
	showCollisions: true,
	setShowCollisions: () => {},
	showMapBounds: true,
	setShowMapBounds: () => {},
});

interface Props {}

export function EditorStateProvider({ children }: PropsWithChildren<Props>) {
	const [theme, setTheme] = useState('');
	const [currentFrame, setCurrentFrame] = useState(0);
	const [showCollisions, setShowCollisions] = useState(true);
	const [showMapBounds, setShowMapBounds] = useState(true);

	return (
		<EditorStateContext.Provider
			value={{
				theme,
				setTheme,
				currentFrame,
				setCurrentFrame,
				showCollisions,
				setShowCollisions,
				showMapBounds,
				setShowMapBounds,
			}}
		>
			{children}
		</EditorStateContext.Provider>
	);
}
