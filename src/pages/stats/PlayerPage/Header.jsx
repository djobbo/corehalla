import React from 'react';

import './Header/styles.css';

import Icon from '@mdi/react';
import { mdiStar, mdiAccountStarOutline } from '@mdi/js';

import formatTime from '../../../util/formatTime';

function Header({ activePage, setActivePage, playerStats }) {
	return (
		<header>
			<div className='banner-img'>
				<img
					src='https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80'
					alt='Banner_img'
				/>
			</div>
			<div className='header-info'>
				<div className='profile-picture'>
					<a className='add-to-fav-btn' href='/#'>
						<Icon
							path={mdiStar}
							title='Add to favorites'
							size={2}
						/>
					</a>
					<img
						src='https://images.unsplash.com/photo-1583169724482-1a7a82ddf87e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=700&q=80'
						alt='Profile_img'
					/>
				</div>
				<div className='main-info'>
					<h1>
						{playerStats.name}{' '}
						{/* <a href='/#'>
							<Icon
								path={mdiAccountStarOutline}
								title='Add to favorites'
								size={1}
							/>
						</a> */}
					</h1>
					<p>
						Level {playerStats.level} ({playerStats.xp} xp)
					</p>
					<p>
						Time spent in game:{' '}
						{formatTime(
							playerStats.legends.reduce(
								(acc, l) => acc + l.matchtime,
								0
							)
						)}
					</p>
				</div>
			</div>

			<nav className='main-nav'>
				<ul>
					<li className={activePage === 'overview' ? 'active' : null}>
						<a
							href='#overview'
							onClick={e => setActivePage('overview')}
						>
							Overview
						</a>
					</li>
					<li className={activePage === 'teams' ? 'active' : null}>
						<a href='#teams' onClick={e => setActivePage('teams')}>
							Teams
						</a>
					</li>
					<li className={activePage === 'legends' ? 'active' : null}>
						<a
							href='#legends'
							onClick={e => setActivePage('legends')}
						>
							Legends
						</a>
					</li>
					<li className={activePage === 'weapons' ? 'active' : null}>
						<a
							href='#weapons'
							onClick={e => setActivePage('weapons')}
						>
							Weapons
						</a>
					</li>
				</ul>
			</nav>
		</header>
	);
}

export default Header;
