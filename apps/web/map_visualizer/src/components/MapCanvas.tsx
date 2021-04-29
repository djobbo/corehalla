import styles from '../styles/MapCanvas.module.scss';
import { Stage, Layer, Line, Group } from 'react-konva';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useMapNodesContext } from '../providers/MapNodesProvider';
import { KonvaEventObject } from 'konva/types/Node';
import { URLImage } from './URLImage';
import { getAnimationPos } from '../util/getAnimationPos';
import { useEditorStateContext } from '../providers/EditorStateProvider';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';

interface Props {
    floating?: boolean;
}

const useDrag = () => {
    const [freezeDragPos, setFreezeDragPos] = useState<{
        x: number;
        y: number;
    }>({ x: null, y: null });
    const [freezeDrag, setFreezeDrag] = useState({ x: false, y: false });

    const handleDragStart = (e: KonvaEventObject<DragEvent>) => {
        setFreezeDragPos(e.target.position());
        console.log(e.target.position());
    };

    const freezeDragFn = (pos: { x: number; y: number }) => ({
        x: freezeDrag.x ? freezeDragPos.x : pos.x,
        y: freezeDrag.y ? freezeDragPos.y : pos.y,
    });

    return { freezeDragPos, freezeDrag, setFreezeDrag, freezeDragFn, handleDragStart };
};

const useCanvasActions = (floating: boolean) => {
    const {
        setStageTransform,
        updateStageTransform,
        stageTransform: { stageScale },
        loadedNewMap,
        setLoadedNewMap,
        setTimeFlow,
    } = useEditorStateContext();

    const { mapData } = useMapNodesContext();

    const [floatingStageTransform, setFloatingStageTransform] = useState<IStageTransform>({
        stageScale: 1,
        stageX: 0,
        stageY: 0,
    });

    const [canvasDimensions, setCanvasDimensions] = useState({
        canvasW: 0,
        canvasH: 0,
    });

    const containerRef = useRef<HTMLDivElement>(null);

    const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();

        const scaleBy = 1.15;
        const stage = e.target.getStage();
        const oldScale = stage.scaleX();
        const mousePointTo = {
            x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
            y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
        };

        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

        stage.scale({ x: newScale, y: newScale });

        setStageTransform({
            stageScale: newScale,
            stageX: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
            stageY: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
        });
    };

    const handleStageDrag = (e: KonvaEventObject<DragEvent>) => {
        const { x, y } = e.target.position();
        updateStageTransform({ stageX: x, stageY: y });
    };

    const getDefaultStageTransform = (maxWidth: number) => {
        const newScale = maxWidth / mapData.cameraBounds.w || stageScale;
        return {
            stageScale: newScale,
            stageX: -mapData.cameraBounds.x * newScale,
            stageY: -mapData.cameraBounds.y * newScale,
        };
    };

    // TODO: correct map zoom
    useEffect(() => {
        if (loadedNewMap) {
            setStageTransform(getDefaultStageTransform(canvasDimensions.canvasW));
            setLoadedNewMap(false);
        } else console.log('bruh');
    }, [loadedNewMap]);

    useEffect(() => {
        setFloatingStageTransform(getDefaultStageTransform(16 * 16));
        //TODO: \/ THIS \/
        if (floating) setTimeFlow(0);
    }, [floating]);

    const updateCanvasSize = () => {
        if (!containerRef || !containerRef.current) return;
        const { offsetWidth, offsetHeight } = containerRef.current;
        console.log(offsetWidth, offsetHeight);
        setCanvasDimensions({
            canvasW: offsetWidth,
            canvasH: offsetHeight,
        });
    };

    useEffect(() => {
        window.addEventListener('resize', updateCanvasSize);
        updateCanvasSize();
    }, []);

    return {
        floatingStageTransform,
        setFloatingStageTransform,
        canvasDimensions,
        setCanvasDimensions,
        containerRef,
        handleWheel,
        handleStageDrag,
    };
};

const CanvasPlatform = ({ platform, assetDir }: { platform: Platform | Asset; assetDir: string }) => {
    useEffect(() => {
        console.log('assetDIROIJHDOIASJD', assetDir);
    }, [assetDir]);

    const { theme } = useEditorStateContext();
    return (
        (platform.themes.length <= 0 || [...platform.themes].includes(theme)) && (
            <Fragment key={platform.id}>
                {platform.assetName && <URLImage url={`/mapArt/${assetDir}/${platform.assetName}`} {...platform} />}
                <Group
                    x={platform.x}
                    y={platform.y}
                    width={platform.w}
                    height={platform.h}
                    scaleX={platform.scaleX}
                    scaleY={platform.scaleY}
                    rotation={platform.rotation}
                >
                    {platform.type === 'platform' &&
                        [...platform.platforms, ...platform.assets].map((child, i) => (
                            <CanvasPlatform platform={child} key={i} assetDir={assetDir} />
                        ))}
                </Group>
            </Fragment>
        )
    );
};

const CanvasCollision = ({ col }: { col: Collision }) => {
    const { selectCollision, updateCollision } = useMapNodesContext();

    const { freezeDragPos, handleDragStart, freezeDragFn, setFreezeDrag } = useDrag();

    const handleColDrag = (e: KonvaEventObject<DragEvent>) => {
        const id = e.target.id();
        const pos = e.target.position();
        selectCollision(id);

        const xDirMostChanged = Math.abs(pos.x - freezeDragPos.x) >= Math.abs(pos.y - freezeDragPos.y);

        if (e.evt.shiftKey) setFreezeDrag({ x: !xDirMostChanged, y: xDirMostChanged });
        else setFreezeDrag({ x: false, y: false });

        updateCollision(id, (col) => ({
            x1: pos.x,
            y1: pos.y,
            x2: pos.x + col.x2 - col.x1,
            y2: pos.y + col.y2 - col.y1,
        }));
    };

    // const handleDrag = (e: KonvaEventObject<DragEvent>, handleId: '1' | '2') => {
    //     if (!selectedCollision) return;
    //     const pos = e.target.position();

    //     const xDirMostChanged = Math.abs(pos.x - freezeDragPos.x) >= Math.abs(pos.y - freezeDragPos.y);

    //     if (e.evt.shiftKey) setFreezeDrag({ x: !xDirMostChanged, y: xDirMostChanged });
    //     else setFreezeDrag({ x: false, y: false });

    //     updateCollision(selectedCollision.id, () => ({
    //         [`x${handleId}`]: pos.x,
    //         [`y${handleId}`]: pos.y,
    //     }));
    // };

    return (
        <Line
            key={col.id}
            id={col.id}
            x={col.x1}
            y={col.y1}
            points={[0, 0, col.x2 - col.x1, col.y2 - col.y1]}
            stroke={col.type === 'Hard' ? 'rgba(40, 10, 75, 1)' : 'rgba(76, 29, 149, 1)'}
            strokeWidth={10}
            onClick={(e) => selectCollision(e.target.id())}
            draggable
            onDragMove={handleColDrag}
            onDragStart={handleDragStart}
            dragBoundFunc={freezeDragFn}
            onMouseEnter={(e) => {
                const container = e.target.getStage().container();
                container.style.cursor = 'move';
            }}
            onMouseLeave={(e) => {
                const container = e.target.getStage().container();
                container.style.cursor = 'default';
            }}
        />
    );
};

export function MapCanvas({ floating }: Props): JSX.Element {
    const { mapData, deselectCollision } = useMapNodesContext();

    const {
        currentFrame,
        showCollisions,
        showMapBounds,
        stageTransform: { stageScale, stageX, stageY },
    } = useEditorStateContext();

    const {
        floatingStageTransform,
        canvasDimensions: { canvasW, canvasH },
        containerRef,
        handleWheel,
        handleStageDrag,
    } = useCanvasActions(floating);

    const router = useRouter();

    return (
        typeof window !== 'undefined' && (
            <motion.div
                className={`${styles.container} ${floating ? styles.floating : ''}`}
                layoutId="mapCanvas"
                ref={containerRef}
            >
                <img src={`/mapArt/Backgrounds/${mapData.background}`} alt="BG" className={styles.backgroundImg} />
                <Stage
                    width={canvasW}
                    height={canvasH}
                    onWheel={!floating && handleWheel}
                    scaleX={floating ? floatingStageTransform.stageScale : stageScale}
                    scaleY={floating ? floatingStageTransform.stageScale : stageScale}
                    x={floating ? floatingStageTransform.stageX : stageX}
                    y={floating ? floatingStageTransform.stageY : stageY}
                    draggable={!floating}
                    onClick={(e) => {
                        if (floating) {
                            router.push('/');
                            return;
                        }

                        if (e.target === e.target.getStage()) deselectCollision();
                    }}
                    onDragEnd={handleStageDrag}
                >
                    {showMapBounds && !floating && (
                        <Layer>
                            <Line
                                x={mapData.cameraBounds.x}
                                y={mapData.cameraBounds.y}
                                points={[
                                    0,
                                    0,
                                    mapData.cameraBounds.w,
                                    0,
                                    mapData.cameraBounds.w,
                                    mapData.cameraBounds.h,
                                    0,
                                    mapData.cameraBounds.h,
                                ]}
                                closed
                                stroke={'red'}
                                strokeWidth={10}
                            />
                            <Line
                                x={mapData.spawnBotBounds.x}
                                y={mapData.spawnBotBounds.y}
                                points={[
                                    0,
                                    0,
                                    mapData.spawnBotBounds.w,
                                    0,
                                    mapData.spawnBotBounds.w,
                                    mapData.spawnBotBounds.h,
                                    0,
                                    mapData.spawnBotBounds.h,
                                ]}
                                closed
                                stroke={'lime'}
                                strokeWidth={10}
                            />
                        </Layer>
                    )}
                    {/* TODO: Some themed platforms show behind regular platforms */}
                    <Layer>
                        {mapData.platforms.map((plat, i) => (
                            <CanvasPlatform platform={plat} key={i} assetDir={mapData.assetDir} />
                        ))}
                    </Layer>
                    <Layer>
                        {mapData.movingPlatforms.map((plat) => {
                            const anim = mapData.animations.find((a) => a.platId === plat.platId);
                            if (!anim) return null;

                            const pos = getAnimationPos(anim, currentFrame, mapData);
                            // console.log(plat.platId, pos);
                            return (
                                <Group x={pos.x} y={pos.y} key={plat.platId}>
                                    <CanvasPlatform platform={plat} assetDir={mapData.assetDir} />
                                </Group>
                            );
                        })}
                    </Layer>
                    {showCollisions && !floating && (
                        <>
                            <Layer>
                                {mapData.collisions.map((col, i) => (
                                    <CanvasCollision col={col} key={i} />
                                ))}
                            </Layer>
                            <Layer>
                                {mapData.dynamicCollisions.map((col) => {
                                    const anim = mapData.animations.find((a) => a.platId === col.platId);
                                    if (!anim) return null;

                                    const pos = getAnimationPos(anim, currentFrame, mapData);

                                    return (
                                        <Group x={pos.x + col.x} y={pos.y + col.y} key={col.platId}>
                                            {col.collisions.map((child, i) => (
                                                <CanvasCollision col={child} key={i} />
                                            ))}
                                        </Group>
                                    );
                                })}
                            </Layer>
                        </>
                    )}
                    {/* Collision Hanles */}
                    {/* <Layer>
                        {selectedCollision && (
                            <>
                                <Circle
                                    x={selectedCollision.x1}
                                    y={selectedCollision.y1}
                                    radius={25}
                                    fill="rgba(239, 68, 68)"
                                    draggable
                                    onDragMove={(e) => handleDrag(e, '1')}
                                    onDragStart={handleDragStart}
                                    dragBoundFunc={freezeDragFn}
                                    onMouseEnter={(e) => {
                                        const container = e.target.getStage().container();
                                        container.style.cursor = 'move';
                                    }}
                                    onMouseLeave={(e) => {
                                        const container = e.target.getStage().container();
                                        container.style.cursor = 'default';
                                    }}
                                />
                                <Circle
                                    x={selectedCollision.x2}
                                    y={selectedCollision.y2}
                                    radius={25}
                                    fill="rgba(239, 68, 68)"
                                    draggable
                                    onDragMove={(e) => handleDrag(e, '2')}
                                    onDragStart={handleDragStart}
                                    dragBoundFunc={freezeDragFn}
                                    onMouseEnter={(e) => {
                                        const container = e.target.getStage().container();
                                        container.style.cursor = 'move';
                                    }}
                                    onMouseLeave={(e) => {
                                        const container = e.target.getStage().container();
                                        container.style.cursor = 'default';
                                    }}
                                />
                            </>
                        )}
                    </Layer> */}
                </Stage>
            </motion.div>
        )
    );
}
