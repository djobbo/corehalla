import styles from './PageSection.module.scss';
// Library imports
import { PropsWithChildren, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ExpandIcon, CompressIcon, ChevronUpIcon } from './Icons';

interface Props {
	title: string;
	initFoldState?: boolean;
}

export function PageSection({
	children,
	title,
	initFoldState,
}: PropsWithChildren<Props>) {
	const [foldState, setFoldState] = useState(initFoldState ?? false);

	return (
		<div className={styles.container}>
			<a
				className={styles.title}
				href='#'
				onClick={(e) => {
					e.preventDefault();
					setFoldState((oldState) => !oldState);
				}}
			>
				{title}
				{foldState ? CompressIcon : ExpandIcon}
			</a>
			<AnimatePresence>
				{foldState && (
					<motion.div
						initial={{ opacity: 0, height: 0, y: -50 }}
						animate={{ opacity: 1, height: 'auto', y: 0 }}
						exit={{ opacity: 0, height: 0, y: -50 }}
						transition={{ duration: 0.25, ease: 'easeInOut' }}
					>
						<div className={styles.content}>{children}</div>
						<div
							className={styles.icon}
							onClick={() => setFoldState(false)}
						>
							{ChevronUpIcon}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export const SectionSeparator = () => <hr className={styles.separator} />;
