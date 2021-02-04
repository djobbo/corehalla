import { Stage, Layer, Line, Circle } from 'react-konva';
import { useContext, useState } from 'react';
import { MapNodesContext } from '../providers/MapNodesProvider';
import { KonvaEventObject } from 'konva/types/Node';

export function MapCanvas() {
	const {
		collisions,
		setCollisions,
		selectedCollision,
		selectCollision,
	} = useContext(MapNodesContext);

	const [{ stageScale, stageX, stageY }, setStageTransform] = useState({
		stageScale: 1,
		stageX: 0,
		stageY: 0,
	});

	const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
		e.evt.preventDefault();

		const scaleBy = 1.05;
		const stage = e.target.getStage();
		const oldScale = stage.scaleX();
		const mousePointTo = {
			x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
			y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
		};

		const newScale =
			e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

		stage.scale({ x: newScale, y: newScale });

		setStageTransform({
			stageScale: newScale,
			stageX:
				-(mousePointTo.x - stage.getPointerPosition().x / newScale) *
				newScale,
			stageY:
				-(mousePointTo.y - stage.getPointerPosition().y / newScale) *
				newScale,
		});
	};

	const handleDrag = (
		e: KonvaEventObject<DragEvent>,
		handleId: '1' | '2'
	) => {
		if (!selectedCollision) return;
		const pos = e.target.position();
		setCollisions(
			collisions.map((col) =>
				col.id === selectedCollision.id
					? {
							...col,
							[`x${handleId}`]: pos.x,
							[`y${handleId}`]: pos.y,
					  }
					: col
			)
		);
	};

	const handleColDrag = (e: KonvaEventObject<DragEvent>) => {
		const id = e.target.id();
		const pos = e.target.position();
		selectCollision(id);
		setCollisions(
			collisions.map((col) =>
				col.id === id
					? {
							...col,
							x1: pos.x,
							y1: pos.y,
							x2: pos.x + col.x2 - col.x1,
							y2: pos.y + col.y2 - col.y1,
					  }
					: col
			)
		);
	};

	return (
		typeof window !== 'undefined' && (
			<Stage
				width={window.innerWidth}
				height={window.innerHeight}
				onWheel={handleWheel}
				scaleX={stageScale}
				scaleY={stageScale}
				x={stageX}
				y={stageY}
				draggable
			>
				<Layer>
					{collisions.map((col) => (
						<Line
							key={col.id}
							id={col.id}
							x={col.x1}
							y={col.y1}
							points={[0, 0, col.x2 - col.x1, col.y2 - col.y1]}
							tension={0.5}
							closed
							stroke={col.type === 'Hard' ? 'black' : 'gray'}
							strokeWidth={10}
							onClick={(e) => selectCollision(e.target.id())}
							draggable
							onDragMove={handleColDrag}
						/>
					))}
				</Layer>
				<Layer>
					{selectedCollision && (
						<>
							<Circle
								x={selectedCollision.x1}
								y={selectedCollision.y1}
								radius={25}
								fill='green'
								draggable
								onDragMove={(e) => handleDrag(e, '1')}
								// onDragEnd={handleDragEnd}
							/>
							<Circle
								x={selectedCollision.x2}
								y={selectedCollision.y2}
								radius={25}
								fill='green'
								draggable
								onDragMove={(e) => handleDrag(e, '2')}
							/>
						</>
					)}
				</Layer>
			</Stage>
		)
	);
}
