// Library imports
import React, { FC, useContext, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, useParams } from 'react-router-dom';
import { IRanking1v1Format, RankedRegion } from 'corehalla.js';
import loadable from '@loadable/component';

// Hooks
import { useFetchData } from '../../hooks/useFetchData';
import { useMockData } from '../../hooks/useMockData';

// Layout imports
import { MainLayout } from '../../layout';
import { NavigationContext } from '../../providers/NavigationProvider';
import qs from 'qs';

// Tabs imports
const Rankings1v1Tab = loadable(() => import('./Rankings1v1Tab'), {
    resolveComponent: (mod) => mod.Rankings1v1Tab,
});
// const Rankings2v2Tab = loadable(() => import('./Rankings2v2Tab'), {
//     resolveComponent: (mod) => mod.Rankings2v2Tab,
// });

type Bracket = '1v1' | '2v2' | 'power1v1' | 'power2v2';

export const RankingsPage: FC = () => {
    const { setActivePage } = useContext(NavigationContext);

    useEffect(() => {
        setActivePage('Rankings');
    }, []);

    // Fetch Rankings Options
    const { bracket = '1v1', region = 'all', page = '1' } = useParams<{
        bracket: Bracket;
        region: RankedRegion;
        page: string;
    }>();
    const { search } = useLocation();
    const playerSearch = qs.parse(search.substring(1)).p || '';

    // Fetch Rankings
    const [rankings, loading] =
        process.env.NODE_ENV === 'production'
            ? useFetchData<IRanking1v1Format[]>(`/api/rankings/1v1/${region}/${page}?p=${playerSearch}`)
            : useMockData<IRanking1v1Format[]>('1v1Rankings', 0);

    const renderRankings1v1Tab = () => <Rankings1v1Tab rankings={rankings} />;

    return (
        <>
            {!loading && (
                <Helmet>
                    <title>
                        {bracket} Rankings - {region.toUpperCase()} - Page {page} • Corehalla
                    </title>
                </Helmet>
            )}
            <MainLayout<Bracket, RankedRegion>
                title={
                    loading
                        ? 'loading'
                        : `${
                              region.toUpperCase() === 'ALL' ? '' : `${region.toUpperCase()} `
                          }${bracket} Rankings - Page ${page}`
                }
                tabs={{
                    ['1v1']: {
                        render: renderRankings1v1Tab,
                        displayName: 'Ranked 1v1',
                        link: `/rankings/1v1/${region}/1`,
                    },
                }}
                defaultTab="1v1"
                loading={loading}
            ></MainLayout>
        </>
    );
};
