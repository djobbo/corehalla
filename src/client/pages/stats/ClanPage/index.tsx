// Library imports
import React, { useState, useEffect, FC } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { IClanFormat } from 'corehalla.js';

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
    const { id: clanId } = useParams<{ id: string }>();
    const { hash } = useLocation<{ hash: ClanStatsTab }>();
    const activeTab: ClanStatsTab = ['#members'].includes(hash) ? (hash as ClanStatsTab) : '#overview';

    const [loading, setLoading] = useState(true);
    const [, setError] = useState(false);
    const [clanStats, setClanStats] = useState<IClanFormat>();

    useEffect(() => {
        if (process.env.NODE_ENV === 'production') {
            const abortController = new AbortController();
            const signal = abortController.signal;

            fetch(`/api/stats/clan/${clanId}`, { signal })
                .then(async (res) => {
                    const data = (await res.json()) as IClanFormat;
                    setClanStats(data);
                    setLoading(false);
                })
                .catch(() => {
                    setError(true);
                });

            return () => abortController.abort();
        } else {
            const timeout = setTimeout(async () => {
                const { ClanStats } = await import('../../../mockups/ClanStats');
                setClanStats(ClanStats);
                setLoading(false);
            }, 0);

            return () => clearTimeout(timeout);
        }
    }, []);

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
