import { useEditorStateContext } from '../providers/EditorStateProvider';
import styles from '../styles/Timeline.module.scss';

export function Timeline(): JSX.Element {
    const { currentFrame, setCurrentFrame, timeFlow, setTimeFlow } = useEditorStateContext();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.timeFlow}>
                    <input
                        className={styles.input}
                        type="number"
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
                        type="number"
                        value={Math.round(currentFrame)}
                        onChange={(e) => {
                            const frame = parseInt(e.target.value);
                            setCurrentFrame(isNaN(frame) ? 0 : frame);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
