import React, { useContext, CSSProperties, FC } from 'react';
import { Switch, Route, useLocation } from 'react-router-dom';
import { Page } from './components/Page';

import { IndexPage } from './pages/IndexPage';
import { RankingsPage } from './pages/RankingsPage';
import { PlayerStatsPage } from './pages/stats/PlayerPage';

import { AnimatePresence } from 'framer-motion';

import { ThemeContext, themeModes } from './ThemeProvider';

export const App: FC = () => {
    const location = useLocation();

    const { themeMode } = useContext(ThemeContext);
    console.log(location);

    return (
        <div id="App" style={themeModes[themeMode] as CSSProperties}>
            <AnimatePresence exitBeforeEnter initial>
                <Switch location={location} key={location.pathname}>
                    <Route path="/" exact>
                        <Page>
                            <IndexPage />
                        </Page>
                    </Route>
                    <Route path="/rankings/:bracket?/:region?/:page?">{/* <RankingsPage /> */}</Route>
                    <Route path="/stats/player/:id" exact>
                        <Page>
                            <PlayerStatsPage />
                        </Page>
                    </Route>
                    <Route path="/stats/clan/:id" exact>
                        <Page>clan</Page>
                    </Route>
                </Switch>
            </AnimatePresence>
        </div>
    );
};
