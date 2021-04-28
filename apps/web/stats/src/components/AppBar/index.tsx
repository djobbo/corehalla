import styles from './index.module.scss';
// Library imports
import { useState } from 'react';
import { motion, useViewportScroll, Variants } from 'framer-motion';
import { Select } from '@Select';

// Components imports
import { IChip, ChipsContainer } from '@ChipsContainer';
import { ITab, TabsContainer } from '@TabsContainer';
import { Navbar } from '@Navbar';

export interface Props<Tabs extends string, Chips extends string, Sort extends string> {
    title?: string;
    tabs?: ITab<Tabs>[];
    chips?: IChip<Chips>[];
    sort?: { options: [Sort, string][]; action: (selected: Sort) => void };
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

export function AppBar<Tabs extends string, Chips extends string, Sort extends string>({
    title,
    tabs,
    chips,
    sort,
}: Props<Tabs, Chips, Sort>): JSX.Element {
    const { scrollY } = useViewportScroll();
    const [hideOnScroll, setHideOnScroll] = useState(false);

    scrollY.onChange(() => {
        const isShow = scrollY.getVelocity() > 0;
        if (isShow !== hideOnScroll) setHideOnScroll(isShow);
    });

    return (
        <>
            <div className={styles.container}>
                <Navbar title={title} />
                <div className={`${styles.extras} ${hideOnScroll ? styles.hidden : ''}`}>
                    <motion.div animate={hideOnScroll ? 'out' : 'in'} variants={extrasContainerVariants}>
                        {tabs && <TabsContainer tabs={tabs} />}
                        {(chips || sort) && (
                            <div className={styles.chipsBar}>
                                <div className={styles.content}>
                                    {chips && <ChipsContainer chips={chips} />}
                                    {sort && (
                                        <motion.div layoutId="AppbarSelect">
                                            <Select<Sort> action={sort.action} title="Sort by" options={sort.options} />
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </>
    );
}
