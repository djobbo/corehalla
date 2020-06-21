import React, { useContext, CSSProperties } from 'react';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';

import { Layout } from './layout';
import { Page } from './components/Page';
import { IndexPage } from './pages/IndexPage';
import { RankingsPage } from './pages/RankingsPage';
import { PlayerStatsPage } from './pages/stats/PlayerPage';
import { ClanStatsPage } from './pages/stats/ClanPage';

import { AnimatePresence } from 'framer-motion';

import { ThemeContext, themes } from './ThemeContext';

import './App/styles.scss';

export const App: React.FC = () => {
    const location = useLocation();
    console.log(location);

    const theme = useContext(ThemeContext);

    return (
        <div id="App" style={themes[theme] as CSSProperties}>
            <Layout>
                <AnimatePresence exitBeforeEnter initial>
                    <Switch location={location} key={location.pathname}>
                        <Route path="/" exact>
                            <Page>
                                <IndexPage />
                            </Page>
                        </Route>
                        <Route path="/rankings/:bracket?/:region?/:page?">
                            <Page>
                                <RankingsPage />
                            </Page>
                        </Route>
                        <Route path="/stats/player/:id" exact>
                            <Page>
                                <PlayerStatsPage />
                            </Page>
                        </Route>
                        <Route path="/stats/clan/:id" exact>
                            <Page>{/* <ClanStatsPage /> */}clan</Page>
                        </Route>
                        {/* <Route path="/">
                            <Redirect to="/" />
                        </Route> */}
                    </Switch>
                </AnimatePresence>
            </Layout>
        </div>
    );
};
