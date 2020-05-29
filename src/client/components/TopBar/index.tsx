import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { history } from '../../history';
import qs from 'qs';

import './styles.scss';

import Icon from '@mdi/react';
import { mdiMagnify, mdiDiscord } from '@mdi/js';

import { useDebounce } from '../../hooks/useDebounce';

import Logo from '../../App/logo.png';

const TopBar: React.FC = () => {
	const { search } = useLocation();
	const params = useParams<{
		region: string;
		bracket: string;
		page: string;
	}>();

	const [playerSearch, setPlayerSearch] = useState(
		(qs.parse(search.substring(1)).p as string) || ''
	);
	const [debouncedPlayerSecarch] = useDebounce(playerSearch, 1000);
	const [initialRender, setInitialRender] = useState(true);

	useEffect(() => {
		if (debouncedPlayerSecarch && !initialRender) {
			window.location.href = `/rankings/${params.bracket || '1v1'}/${
				params.region || 'all'
			}/${params.page || '1'}?p=${debouncedPlayerSecarch}`;
		} else {
			console.log('results');
		}
		setInitialRender(false);
	}, [debouncedPlayerSecarch]);

	return (
		<div className='topbar'>
			<div className='topbar-nav'>
				<div className='logo'>
					<Link to='/'>
						<img src={Logo} alt='Logo' />
					</Link>
				</div>
				<div className='searchbox'>
					<i>
						<Icon path={mdiMagnify} title='Discord' size={1} />
					</i>
					<input
						type='text'
						placeholder='Search Player...'
						value={playerSearch}
						onChange={(e) => setPlayerSearch(e.target.value)}
					/>
				</div>
				<nav>
					<ul>
						<li>
							<Link to='/rankings'>Rankings</Link>
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
};

export default TopBar;
