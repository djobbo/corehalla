import React from 'react';
import { Router, Switch, Route } from 'react-router-dom';
import history from './history';

import Icon from '@mdi/react';
import { mdiMagnify, mdiDiscord } from '@mdi/js';

import Logo from './App/logo.png';

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

function TopBar() {
	return (
		<div className='topbar'>
			<div className='topbar-nav'>
				<div className='logo'>
					<a href='/'>
						<img src={Logo} alt='Logo' />
					</a>
				</div>
				<div className='searchbox'>
					<i>
						<Icon path={mdiMagnify} title='Discord' size={1} />
					</i>
					<input type='text' placeholder='Search Player...' />
				</div>
				<nav>
					<ul>
						<li>
							<a href='/'>Rankings</a>
						</li>
						<li>
							<a href='/'>
								<Icon
									path={mdiDiscord}
									title='Discord'
									size={1}
								/>
							</a>
						</li>
					</ul>
				</nav>
			</div>
		</div>
	);
}
