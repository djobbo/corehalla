import styles from './index.module.scss';

interface Props<T extends string> {
	options: [option: T, displayName: string][];
	action: (selected: T) => void;
	title: string;
}

export function Select<T extends string>({
	options,
	action,
	title,
}: Props<T>): React.ReactElement {
	return (
		<select
			className={styles.options}
			onChange={(e) => {
				action(e.target.value as T);
			}}
		>
			{options.map(([option, displayName]) => (
				<option key={option} value={option}>
					{displayName ?? option}
				</option>
			))}
		</select>
	);
}
