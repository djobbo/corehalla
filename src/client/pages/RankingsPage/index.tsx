// Library imports
import React, { FC } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { IRanking1v1Format, RankedRegion } from 'corehalla.js';

// Hooks
import { useFetchData } from '../../hooks/useFetchData';
import { useMockData } from '../../hooks/useMockData';

// Components imports
import { AppBar } from '../../components/AppBar';
import { BottomNavigationBar } from '../../components/BottomNavigationBar';
import { Loader } from '../../components/Loader';
import { Page, PageContentWrapper } from '../../components/Page';

// Tabs imports
import { Rankings1v1Tab } from './Rankings1v1Tab';
import { Rankings2v2Tab } from './Rankings2v2Tab';

type Bracket = '1v1' | '2v2' | 'power1v1' | 'power2v2';

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

export const RankingsPage: FC = () => {
    // Fetch Player ID
    const { bracket = '1v1', region = 'all', page = '1' } = useParams<{
        bracket: string;
        region: RankedRegion;
        page: string;
    }>();

    // Fetch Player Stats
    const [rankings, loading] =
        process.env.NODE_ENV === 'production'
            ? useFetchData<IRanking1v1Format[]>(`/api/rankings/${bracket}/${region}/${page}`)
            : useMockData<IRanking1v1Format[]>('1v1Rankings', 250);

    const renderActiveTab = () => {
        switch (bracket) {
            case '2v2':
                return <Rankings2v2Tab />;
            default:
                return <Rankings1v1Tab rankings={rankings} />;
        }
    };

    return (
        <Page>
            {!loading && (
                <Helmet>
                    <title>
                        {region} {bracket} - Page {page} • Corehalla
                    </title>
                </Helmet>
            )}
            <AppBar
                title={loading ? 'loading' : `${region.toUpperCase()} ${bracket} - Page ${page}`}
                tabs={[
                    { title: '1v1', link: `/rankings/1v1/${region}/1`, active: bracket === '1v1' },
                    { title: '2v2', link: `/rankings/2v2/${region}/1`, active: bracket === '2v2' },
                    { title: 'Power 1v1', link: `/rankings/power1v1/${region}/1`, active: bracket === 'power1v1' },
                    { title: 'Power 2v2', link: `/rankings/power2v2/${region}/1`, active: bracket === 'power2v2' },
                ]}
                chips={[
                    {
                        title: 'All',
                        link: `/rankings/${bracket}/all/1`,
                        active: region === 'all',
                    },
                    {
                        title: 'US-E',
                        link: `/rankings/${bracket}/us-e/1`,
                        active: region === 'us-e',
                    },
                    {
                        title: 'EU',
                        link: `/rankings/${bracket}/eu/1`,
                        active: region === 'eu',
                    },
                    {
                        title: 'SEA',
                        link: `/rankings/${bracket}/sea/1`,
                        active: region === 'sea',
                    },
                    {
                        title: 'BRZ',
                        link: `/rankings/${bracket}/brz/1`,
                        active: region === 'brz',
                    },
                    {
                        title: 'AUS',
                        link: `/rankings/${bracket}/aus/1`,
                        active: region === 'aus',
                    },
                    {
                        title: 'US-W',
                        link: `/rankings/${bracket}/us-w/1`,
                        active: region === 'us-w',
                    },
                    {
                        title: 'JPN',
                        link: `/rankings/${bracket}/jpn/1`,
                        active: region === 'jpn',
                    },
                ]}
            />
            <PageContentWrapper pTop="10rem" pBtm="3.5rem">
                <AnimatePresence exitBeforeEnter initial>
                    {loading ? (
                        <Loader key="loader" />
                    ) : (
                        <motion.div key="page" animate={{ opacity: 1 }} initial={{ opacity: 0 }}>
                            <main>
                                <AnimatePresence exitBeforeEnter initial>
                                    <motion.div
                                        key={bracket}
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
