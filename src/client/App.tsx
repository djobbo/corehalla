import React from 'react';
import { Router, Switch, Route } from 'react-router-dom';
import { history } from './history';

import { Layout } from './layout';
import { IndexPage } from './pages/IndexPage';
import { RankingsPage } from './pages/RankingsPage';
import { PlayerStatsPage } from './pages/stats/PlayerPage';
import { ClanStatsPage } from './pages/stats/ClanPage';

import './App/styles.scss';

export const App: React.FC = () => {
    return (
        <Router history={history}>
            <div className="App">
                <Switch>
                    <Layout>
                        <Route path="/" exact>
                            <IndexPage />
                        </Route>
                        <Route path="/rankings/:bracket?/:region?/:page?">
                            <RankingsPage />
                        </Route>
                        <Route path="/stats/player/:id" exact>
                            <PlayerStatsPage />
                        </Route>
                        <Route path="/stats/clan/:id" exact>
                            <ClanStatsPage />
                        </Route>
                        <Route path="/test">Corehalla</Route>
                    </Layout>
                </Switch>
            </div>
        </Router>
    );
};
