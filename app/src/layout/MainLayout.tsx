// Library imports
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Hooks
import { useHashTabs } from '../hooks/useHashTabs';

// Components imports
import { AppBar } from '../components/AppBar';
import { SideNav } from '../components/SideNav';
import { Loader } from '../components/Loader';
import { Page } from '../components/Page';
import styled from 'styled-components';

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

interface Props<T extends string, U extends string> {
    tabs: {
        [k in T]?: ITab<U>;
    };
    title: string;
    defaultTab?: T;
    loading?: boolean;
}

const Wrapper = styled.div``;

export function MainLayout<T extends string, U extends string>({
    tabs,
    title,
    loading,
    defaultTab,
}: Props<T, U>): React.ReactElement<Props<T, U>> {
    // Initialize Tabs
    const [activeTab] = tabs ? useHashTabs<T>(Object.keys(tabs) as T[], defaultTab || null) : null;

    // Initialize Chips
    const [activeChip, setActiveChip] = useState<U>(null);

    const renderActiveTab = () => {
        if (!activeTab || !tabs[activeTab]) return null;

        const currentChips = tabs[activeTab].chips;
        if (currentChips && !activeChip) setActiveChip(tabs[activeTab].defaultChip);
        return tabs[activeTab].render(activeChip);
    };

    return (
        <>
            <Wrapper>
                <AppBar
                    tabs={(Object.entries(tabs) as [T, ITab<U>][]).map(([tabName, { displayName, link }]) => ({
                        displayName: displayName || tabName,
                        link: link || `#${tabName}`,
                        active: activeTab === tabName,
                    }))}
                    chips={tabs[activeTab]?.chips?.map(({ chipName, displayName }) => ({
                        displayName: displayName || chipName,
                        active: activeChip === chipName,
                        action: () => setActiveChip(chipName),
                    }))}
                    title={title}
                />
                <Page>
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
                </Page>
            </Wrapper>
            <SideNav />
        </>
    );
}
