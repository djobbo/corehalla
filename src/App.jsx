import React from 'react';
import { Router, Switch, Route } from 'react-router-dom';
import history from './history';

import TopBar from './components/TopBar';
import PlayerStatsPage from './pages/stats/PlayerPage';

export default () => {
	return (
		<Router history={history}>
			<div className='App'>
				<TopBar />
				<Switch>
					<Route path='/' exact component={PlayerStatsPage} />
					<Route path='/test'>RAM Portal</Route>
				</Switch>
			</div>
		</Router>
	);
};
