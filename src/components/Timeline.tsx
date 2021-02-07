import { useContext } from 'react';
import { EditorStateContext } from '../providers/EditorStateProvider';
import styles from '../styles/Timeline.module.scss';

export function Timeline() {
	const { currentFrame, setCurrentFrame, timeFlow, setTimeFlow } = useContext(
		EditorStateContext
	);

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<div className={styles.timeFlow}>
					<input
						className={styles.input}
						type='number'
						value={timeFlow}
						onChange={(e) => {
							const flow = parseInt(e.target.value);
							setTimeFlow(isNaN(flow) ? 0 : flow);
						}}
					/>
				</div>
				<div className={styles.currentFrame}>
					<input
						className={styles.input}
						type='number'
						value={Math.round(currentFrame)}
						onChange={(e) => {
							setCurrentFrame(parseInt(e.target.value));
						}}
					/>
				</div>
			</div>
		</div>
	);
}
