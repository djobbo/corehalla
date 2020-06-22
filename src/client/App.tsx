import React, { useContext, CSSProperties, FC } from 'react';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';

import { Layout } from './layout';
import { Page } from './components/Page';
import { Footer } from './components/Footer';
import { IndexPage } from './pages/IndexPage';
import { RankingsPage } from './pages/RankingsPage';
import { PlayerStatsPage } from './pages/stats/PlayerPage';
import { ClanStatsPage } from './pages/stats/ClanPage';

import { AnimatePresence } from 'framer-motion';

import { ThemeContext, themeModes } from './ThemeProvider';

import './App/styles.scss';

export const App: FC = () => {
    const location = useLocation();
    console.log(location);

    const { themeMode } = useContext(ThemeContext);

    return (
        <div id="App" style={themeModes[themeMode] as CSSProperties}>
            <Layout>
                <AnimatePresence exitBeforeEnter initial>
                    <Switch location={location} key={location.pathname}>
                        <Route path="/" exact>
                            <Page>
                                <IndexPage />
                                <Footer />
                            </Page>
                        </Route>
                        <Route path="/rankings/:bracket?/:region?/:page?">
                            <Page>
                                <RankingsPage />
                                <Footer />
                            </Page>
                        </Route>
                        <Route path="/stats/player/:id" exact>
                            <Page>
                                <PlayerStatsPage />
                                <Footer />
                            </Page>
                        </Route>
                        <Route path="/stats/clan/:id" exact>
                            <Page>
                                {/* <ClanStatsPage /> */}clan
                                <Footer />
                            </Page>
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
