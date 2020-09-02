import React, { useContext, CSSProperties, FC } from 'react';
import { Switch, Route, useLocation, Link, BrowserRouter as Router } from 'react-router-dom';
import { Page } from './components/Page';

import { IndexPage } from './pages/IndexPage';
import { RankingsPage } from './pages/RankingsPage';
import { PlayerStatsPage } from './pages/stats/PlayerPage';

import { AnimatePresence } from 'framer-motion';

import { ThemeContext, themeModes } from './ThemeProvider';

export const App: FC = () => {
    const location = useLocation();

    const { themeMode } = useContext(ThemeContext);

    return (
        <div id="App" style={themeModes[themeMode] as CSSProperties}>
            <AnimatePresence exitBeforeEnter initial>
                <Switch location={location} key={location.pathname}>
                    <Route path="/" exact>
                        <IndexPage />
                        <Link to="/stats/player/4281946">bruh</Link>
                    </Route>
                    <Route path="/rankings/:bracket?/:region?/:page?">{/* <RankingsPage /> */}</Route>
                    <Route path="/stats/player/:id/:tab?" exact>
                        <PlayerStatsPage />
                    </Route>
                    <Route path="/stats/clan/:id/:tab?" exact>
                        <Page>clan</Page>
                    </Route>
                </Switch>
            </AnimatePresence>
        </div>
    );
};
