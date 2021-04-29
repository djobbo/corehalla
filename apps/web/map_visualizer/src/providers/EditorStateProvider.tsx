import React, { createContext, useState, Dispatch, ReactNode, useContext } from 'react';
import useInterval from '../hooks/useInterval';

interface IEditorStateContext {
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
    updateStageTransform: (transform: Partial<IStageTransform>) => void;
    loadedNewMap: boolean;
    setLoadedNewMap: Dispatch<React.SetStateAction<boolean>>;
}

const EditorStateContext = createContext<IEditorStateContext>({
    theme: '',
    setTheme: () => ({}),
    currentFrame: 0,
    setCurrentFrame: () => ({}),
    showCollisions: true,
    setShowCollisions: () => ({}),
    showMapBounds: true,
    setShowMapBounds: () => ({}),
    stageTransform: { stageScale: 1, stageX: 0, stageY: 0 },
    setStageTransform: () => ({}),
    timeFlow: 0,
    setTimeFlow: () => ({}),
    updateStageTransform: () => ({}),
    loadedNewMap: false,
    setLoadedNewMap: () => ({}),
});

interface Props {
    children: ReactNode;
}

export const useEditorStateContext = (): IEditorStateContext => useContext(EditorStateContext);

export function EditorStateProvider({ children }: Props): JSX.Element {
    const [theme, setTheme] = useState('');
    const [currentFrame, setCurrentFrame] = useState(0);
    const [showCollisions, setShowCollisions] = useState(true);
    const [showMapBounds, setShowMapBounds] = useState(true);
    const [currentFileName, setCurrentFileName] = useState(false);

    const [stageTransform, setStageTransform] = useState<IStageTransform>({
        stageScale: 0.6,
        stageX: 0,
        stageY: 0,
    });

    const updateStageTransform = (transform: Partial<IStageTransform>) => {
        setStageTransform((tr) => ({ ...tr, ...transform }));
    };

    const [timeFlow, setTimeFlow] = useState(0);

    useInterval(
        () => {
            setCurrentFrame((frame) => frame + timeFlow / 60);
        },
        timeFlow === 0 ? null : 1000 / 60,
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
                updateStageTransform,
                loadedNewMap: currentFileName,
                setLoadedNewMap: setCurrentFileName,
            }}
        >
            {children}
        </EditorStateContext.Provider>
    );
}
