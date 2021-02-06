import React, {
	createContext,
	useState,
	PropsWithChildren,
	Dispatch,
} from 'react';
import useInterval from '../hooks/useInterval';

interface IStageTransform {
	stageScale: number;
	stageX: number;
	stageY: number;
}

export const EditorStateContext = createContext<{
	theme: string;
	setTheme: Dispatch<React.SetStateAction<string>>;
	currentFrame: number;
	setCurrentFrame: Dispatch<React.SetStateAction<number>>;
	showCollisions: boolean;
	setShowCollisions: Dispatch<React.SetStateAction<boolean>>;
	showMapBounds: boolean;
	setShowMapBounds: Dispatch<React.SetStateAction<boolean>>;
	stageTransform: IStageTransform;
	setStageTransform: Dispatch<React.SetStateAction<IStageTransform>>;
	timeFlow: number;
	setTimeFlow: Dispatch<React.SetStateAction<number>>;
}>({
	theme: '',
	setTheme: () => {},
	currentFrame: 0,
	setCurrentFrame: () => {},
	showCollisions: true,
	setShowCollisions: () => {},
	showMapBounds: true,
	setShowMapBounds: () => {},
	stageTransform: { stageScale: 1, stageX: 0, stageY: 0 },
	setStageTransform: () => {},
	timeFlow: 0,
	setTimeFlow: () => {},
});

interface Props {}

export function EditorStateProvider({ children }: PropsWithChildren<Props>) {
	const [theme, setTheme] = useState('');
	const [currentFrame, setCurrentFrame] = useState(0);
	const [showCollisions, setShowCollisions] = useState(true);
	const [showMapBounds, setShowMapBounds] = useState(true);

	const [stageTransform, setStageTransform] = useState<IStageTransform>({
		stageScale: 0.6,
		stageX: 0,
		stageY: 0,
	});

	const [timeFlow, setTimeFlow] = useState(0);

	useInterval(
		() => {
			setCurrentFrame((frame) => frame + timeFlow / 60);
		},
		timeFlow === 0 ? null : 1000 / 60
	);

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
				stageTransform,
				setStageTransform,
				timeFlow,
				setTimeFlow,
			}}
		>
			{children}
		</EditorStateContext.Provider>
	);
}
