import styles from './index.module.scss';
import { motion } from 'framer-motion';
import { PropsWithChildren } from 'react';

interface Props {
	title?: string;
}

export function Card({ title, children }: PropsWithChildren<Props>) {
	return (
		<motion.div className={styles.container}>
			{title && <span className={styles.title}>{title}</span>}
			<div>{children}</div>
		</motion.div>
	);
}
