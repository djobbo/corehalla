// Library imports
import React, { FC, PropsWithChildren } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Components imports
import { Page } from '@components/Page';
import { SideNavLayout } from './SideNavLayout';

interface ITab<T> {
	render: (activeChip: T) => React.ReactElement;
	displayName?: string;
	chips?: {
		chipName: T;
		displayName?: string;
	}[];
	defaultChip?: T;
	link?: string;
}

interface Props {}

export const LandingLayout: FC<PropsWithChildren<Props>> = ({
	children,
}: PropsWithChildren<Props>) => {
	return (
		<SideNavLayout>
			<AnimatePresence exitBeforeEnter initial>
				<motion.div
					key='page'
					animate={{ opacity: 1 }}
					initial={{ opacity: 0 }}
				>
					<main>{children}</main>
				</motion.div>
			</AnimatePresence>
		</SideNavLayout>
	);
};
