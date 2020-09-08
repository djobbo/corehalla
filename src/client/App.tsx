import React, { useContext, CSSProperties, FC } from 'react';
import { Switch, Route, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { Page } from './components/Page';

import { IndexPage } from './pages/IndexPage';
import { RankingsPage } from './pages/RankingsPage';
import { PlayerStatsPage } from './pages/stats/PlayerPage';

import { AnimatePresence } from 'framer-motion';

import { ThemeContext, themeModes } from './providers/ThemeProvider';

const AppWrapper = styled.div`
    min-height: 100vh;
    background-color: var(--bg);
`;

export const App: FC = () => {
    const location = useLocation();

    const { themeMode } = useContext(ThemeContext);

    return (
        <AppWrapper id="App" style={themeModes[themeMode] as CSSProperties}>
            <AnimatePresence exitBeforeEnter initial>
                <Switch location={location} key={location.pathname}>
                    <Route path="/" exact>
                        <Page>
                            <IndexPage />
                        </Page>
                    </Route>
                    <Route path="/rankings/:bracket?/:region?/:page?">{/* <RankingsPage /> */}</Route>
                    <Route path="/stats/player/:id" exact>
                        <PlayerStatsPage />
                    </Route>
                    <Route path="/stats/clan/:id" exact>
                        <Page>clan</Page>
                    </Route>
                </Switch>
            </AnimatePresence>
        </AppWrapper>
    );
};
