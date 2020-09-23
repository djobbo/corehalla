// Library imports
import React, { FC, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Hooks
import { useHashTabs } from '../hooks/useHashTabs';

// Components imports
import { AppBar, AppBarProps } from '../components/AppBar';
import { BottomNavigationBar } from '../components/BottomNavigationBar';
import { Loader } from '../components/Loader';
import { Page, PageContentWrapper } from '../components/Page';

const sectionTransition = {
    in: {
        opacity: 1,
    },
    out: {
        opacity: 0,
    },
    init: {
        opacity: 0,
    },
};

interface Props<T extends string, U extends 'all'> extends AppBarProps<T, U> {
    tabComponents?: { [k in T]: FC };
    defaultTab: T;
    loading: boolean;
}

export function MainLayout<T extends string, U extends 'all'>({
    tabs,
    chips,
    tabComponents,
    title,
    loading,
    defaultTab,
}: Props<T, U>): React.ReactElement<Props<T, U>> {
    // Initialize Tabs
    const [activeTab] = tabs
        ? useHashTabs<T>(
              tabs.map((tab) => tab.title),
              defaultTab || tabs[0].title || ('' as T),
          )
        : ['' as T];

    const [activeChip, setActiveChip] = useState<U>('all');

    const renderActiveTab = () => tabComponents[activeTab];

    return (
        <>
            <AppBar
                tabs={tabs}
                chips={chips?.map((chip) => ({ ...chip, active: chip.title === activeChip }))}
                title={title}
            />
            <Page>
                <PageContentWrapper>
                    <AnimatePresence exitBeforeEnter initial>
                        {loading ? (
                            <Loader key="loader" />
                        ) : (
                            <motion.div key="page" animate={{ opacity: 1 }} initial={{ opacity: 0 }}>
                                <main>
                                    <AnimatePresence exitBeforeEnter initial>
                                        <motion.div
                                            key={activeTab}
                                            animate="in"
                                            exit="out"
                                            initial="init"
                                            variants={sectionTransition}
                                            transition={{ default: { duration: 0.25, ease: 'easeInOut' } }}
                                        >
                                            {renderActiveTab()}
                                        </motion.div>
                                    </AnimatePresence>
                                </main>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </PageContentWrapper>
            </Page>
            <BottomNavigationBar />
        </>
    );
}
