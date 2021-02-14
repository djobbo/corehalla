import styles from './AppBar.module.scss';
// Library imports
import { useState, ReactElement } from 'react';
import { motion, Variants } from 'framer-motion';

// Custom Hooks imports
import { useScrollPosition } from '@hooks/useScrollPosition';

// Components imports
import { IChip, ChipsContainer } from './ChipsContainer';
import { ITab, TabsContainer } from './TabsContainer';
import { Navbar } from './Navbar';

export interface Props<T extends string, U extends string> {
	title?: string;
	tabs?: ITab<T>[];
	chips?: IChip<U>[];
}

const extrasContainerVariants: Variants = {
	in: {
		opacity: 1,
		y: 0,
		transition: { ease: 'linear', duration: 0.125 },
	},
	out: {
		opacity: 0,
		y: -80,
	},
};

export function AppBar<T extends string, U extends string>({
	title,
	tabs,
	chips,
}: Props<T, U>) {
	const [hideOnScroll, setHideOnScroll] = useState(false);

	useScrollPosition(
		({ currScrollPos, prevScrollPos }) => {
			const isShow = currScrollPos > prevScrollPos;
			if (isShow !== hideOnScroll) setHideOnScroll(isShow);
		},
		[hideOnScroll]
	);

	return (
		<>
			<div className={styles.container}>
				<Navbar title={title} />
			</div>
			<div className={styles.extras}>
				<motion.div
					animate={hideOnScroll ? 'out' : 'in'}
					variants={extrasContainerVariants}
				>
					{tabs && <TabsContainer tabs={tabs} />}
					{chips && <ChipsContainer chips={chips} />}
				</motion.div>
			</div>
		</>
	);
}
