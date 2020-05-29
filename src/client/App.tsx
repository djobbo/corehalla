import React from 'react';
import { Router, Switch, Route, Redirect } from 'react-router-dom';
import { history } from './history';

import TopBar from './components/TopBar';
import IndexPage from './pages/IndexPage';
import RankingsPage from './pages/RankingsPage';
import PlayerStatsPage from './pages/stats/PlayerPage';
import ClanStatsPage from './pages/stats/ClanPage';

import { RankedRegion } from 'corehalla.js';

import './App/styles.scss';

const App: React.FC = () => {
	return (
		<Router history={history}>
			<div className='App'>
				<Switch>
					<Route path='/' exact>
						<TopBar />
						<IndexPage />
					</Route>
					<Route path='/rankings/:bracket?/:region?/:page?'>
						<TopBar />
						<RankingsPage />
					</Route>
					<Route path='/stats/player/:id' exact>
						<PlayerStatsPage />
					</Route>
					<Route path='/stats/clan/:id' exact>
						<ClanStatsPage />
					</Route>
					<Route path='/test'>Corehalla</Route>
				</Switch>
			</div>
		</Router>
	);
};

export default App;
