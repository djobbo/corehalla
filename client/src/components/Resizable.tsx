import {
	cloneElement,
	DragEvent,
	useRef,
	MutableRefObject,
	ReactElement,
	useState,
	useEffect,
} from 'react';
import styles from '../styles/Resizable.module.scss';

interface Props {
	children: ReactElement;
	minWidth?: number;
	maxWidth?: number;
	widthThreshold?: boolean;
}

function ResizeAnchor({
	resizableRef,
	threshold,
	min,
	max,
	setHasHitThreshold,
}: {
	resizableRef: MutableRefObject<HTMLDivElement>;
	threshold?: boolean;
	min: number;
	max: number;
	setHasHitThreshold: (visible: boolean) => void;
}) {
	const [isDragging, setIsDragging] = useState(false);

	const handleDrag = (e: DragEvent<HTMLDivElement>) => {
		if (!isDragging || !resizableRef?.current) return;

		const { clientX } = e;
		const { offsetLeft } = resizableRef.current;

		let newWidth = clientX - offsetLeft;
		const smallerThanMin = !!min && newWidth < min;
		const largerThanMax = !!max && newWidth > max;
		const hasHitThreshold = smallerThanMin && threshold;

		if (hasHitThreshold) newWidth = 0;
		else if (smallerThanMin) newWidth = min;
		else if (largerThanMax) newWidth = max;

		resizableRef.current.style.width = `${newWidth}px`;
		setHasHitThreshold(hasHitThreshold);
	};

	useEffect(() => {
		console.log(isDragging);
	}, [isDragging]);

	return (
		<div
			className={`${styles.anchor} ${
				isDragging ? styles.isDragging : ''
			}`}
			onMouseDown={() => setIsDragging(true)}
			onMouseUp={() => setIsDragging(false)}
			onMouseMove={handleDrag}
		>
			<div className={styles.indicator} />
		</div>
	);
}

export function Resizable({
	children,
	widthThreshold,
	minWidth,
	maxWidth,
}: Props) {
	const resizableRef = useRef<HTMLDivElement>(null);
	const [hasHitThreshold, setHasHitThreshold] = useState(false);

	return (
		<>
			{cloneElement(
				children,
				{
					className: `${children.props.className || ''} ${
						styles.container
					}`,
					ref: resizableRef,
				},
				[
					!hasHitThreshold && children.props.children,
					<ResizeAnchor
						resizableRef={resizableRef}
						threshold={widthThreshold}
						min={minWidth}
						max={maxWidth}
						setHasHitThreshold={setHasHitThreshold}
					/>,
				]
			)}
		</>
	);
}
