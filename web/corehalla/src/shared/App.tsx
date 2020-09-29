import React, { useContext, CSSProperties, FC } from 'react';
import { Switch, Route, useLocation } from 'react-router-dom';
// TODO: import loadable from '@loadable/component';
import styled, { createGlobalStyle } from 'styled-components';
import { AnimatePresence } from 'framer-motion';

import { Page } from './components/Page';

import { IndexPage } from './pages/IndexPage';
import { RankingsPage } from './pages/RankingsPage';
import { PlayerPage } from './pages/stats/PlayerPage';
import { ClanPage } from './pages/stats/ClanPage';
import { FavoritesPage } from './pages/FavoritesPage';

import { ThemeContext, Theme } from './providers/ThemeProvider';

const GlobalStyle = createGlobalStyle<{ theme: string }>`
  body {
    ${({ theme }) => theme}
  }
`;

const AppWrapper = styled.div`
    height: 100%;
    min-height: 100%;
    margin-left: 4rem;
`;

export const App: FC = () => {
    const location = useLocation();

    const { getThemeStr } = useContext(ThemeContext);

    return (
        <>
            <GlobalStyle theme={getThemeStr()} />
            <AppWrapper id="App">
                <AnimatePresence exitBeforeEnter initial>
                    <Switch location={location} key={location.pathname}>
                        <Route path="/" exact>
                            <Page>
                                <IndexPage />
                            </Page>
                        </Route>
                        <Route path="/rankings/:bracket?/:region?/:page?">
                            <RankingsPage />
                        </Route>
                        <Route path="/stats/player/:id" exact>
                            <PlayerPage />
                        </Route>
                        <Route path="/stats/clan/:id" exact>
                            <ClanPage />
                        </Route>
                        <Route path="/favorites" exact>
                            <FavoritesPage />
                        </Route>
                    </Switch>
                </AnimatePresence>
            </AppWrapper>
        </>
    );
};
