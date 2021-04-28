import styles from './index.module.scss';

export interface IChip<T extends string> {
	displayName: T;
	action?: () => void;
	active?: boolean;
}

export interface Props<T extends string> {
	chips: IChip<T>[];
}

export function ChipsContainer<T extends string>({ chips }: Props<T>) {
	return (
		<div className={styles.container}>
			{chips.map(({ displayName, action, active }, i) => (
				<div
					className={`${styles.chip} ${active ? styles.active : ''}`}
					key={i}
				>
					<a
						href='#'
						onClick={
							action
								? (e) => {
										e.preventDefault();
										action();
								  }
								: null
						}
					>
						{displayName}
					</a>
				</div>
			))}
		</div>
	);
}
