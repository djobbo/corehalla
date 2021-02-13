import styles from './Select.module.scss';

interface IOption<T extends string> {
	name: string;
	value: T;
}

interface Props<T extends string> {
	options: IOption<T>[];
	action: (selected: T) => void;
	title: string;
}

export function Select<T extends string>({
	options,
	action,
	title,
}: Props<T>): React.ReactElement {
	return (
		<div className={styles.container}>
			<span className={styles.title}>{title}</span>
			<select
				className={styles.options}
				onChange={(e) => {
					action(e.target.value as T);
				}}
			>
				{options.map(({ name, value }) => (
					<option key={name} value={value}>
						{name}
					</option>
				))}
			</select>
		</div>
	);
}
