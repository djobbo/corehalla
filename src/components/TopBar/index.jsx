import React from 'react';

import './styles.css';

import Icon from '@mdi/react';
import { mdiMagnify, mdiDiscord } from '@mdi/js';

import Logo from '../../App/logo.png';

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

export default TopBar;
