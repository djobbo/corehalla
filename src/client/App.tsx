import React from 'react';
import { Router, Switch, Route, Redirect } from 'react-router-dom';
import history from './history';

import TopBar from './components/TopBar';
import RankingsPage from './pages/RankingsPage';
import PlayerStatsPage from './pages/stats/PlayerPage';
import ClanStatsPage from './pages/stats/ClanPage';

const App: React.FC = () => {
	return (
		<Router history={history}>
			<div className='App'>
				<TopBar />
				<Switch>
					<Route path='/' exact>
						<Redirect to='/rankings' />
					</Route>
					<Route
						path='/rankings/:bracket?/:region?/:page?'
						component={RankingsPage}
					/>
					<Route
						path='/stats/player/:id'
						exact
						component={PlayerStatsPage}
					/>
					<Route
						path='/stats/clan/:id'
						exact
						component={ClanStatsPage}
					/>
					<Route path='/test'>Corehalla</Route>
				</Switch>
			</div>
		</Router>
	);
};

export default App;
