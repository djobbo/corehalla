// Library imports
import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { IClanFormat } from 'corehalla.js';

// Hooks
import { useFetchData } from '../../../hooks/useFetchData';
import { useMockData } from '../../../hooks/useMockData';
import { useHashTabs } from '../../../hooks/useHashTabs';

// Components imports
import { AppBar } from '../../../components/AppBar';
import { BottomNavigationBar } from '../../../components/BottomNavigationBar';
import { Loader } from '../../../components/Loader';
import { Page, PageContentWrapper } from '../../../components/Page';

// Tabs imports
import { OverviewTab } from './OverviewTab';
import { MembersTab } from './MembersTab';

type ClanStatsTab = '#overview' | '#members';

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

export const ClanStatsPage: FC = () => {
    // Fetch Clan ID
    const { id: clanId } = useParams<{ id: string }>();
    // Initialize Tabs
    const [activeTab] = useHashTabs<ClanStatsTab>(['#overview', '#members'], '#overview');
    // Fetch Clan Stats
    const [clanStats, loading] =
        process.env.NODE_ENV === 'production'
            ? useFetchData<IClanFormat>(`/api/stats/clan/${clanId}`)
            : useMockData<IClanFormat>('ClanStats', 250);

    const renderActiveTab = () => {
        switch (activeTab) {
            case '#members':
                return <MembersTab />;
            default:
                return <OverviewTab />;
        }
    };

    return (
        <Page>
            <AppBar
                title={loading ? 'loading' : 'Revoluchienne' || 'Corehalla'}
                tabs={[
                    { title: 'overview', link: `#`, active: activeTab === '#overview' },
                    { title: 'members', link: `#members`, active: activeTab === '#members' },
                ]}
            />
            <PageContentWrapper pTop="6.5rem">
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
            <BottomNavigationBar />
        </Page>
    );
};
