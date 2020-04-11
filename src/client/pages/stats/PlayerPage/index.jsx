import React, { useState, useEffect } from 'react';
import './styles.scss';

import Header from './Header';
import SectionOverview from './SectionOverview';
import SectionOverallStats from './SectionOverallStats';
import SectionRanked2v2 from './SectionRanked2v2';
import SectionLegends from './SectionLegends';
import SectionWeapons from './SectionWeapons';
import SectionClan from './SectionClan';

import Loader from '../../../components/Loader';

// import PlayerStatsGen from '../../mockups/PlayerStats.mock';
import PlayerStats from '../../../mockups/PlayerStats.json';

export default ({ match }) => {
	const sections = ['teams', 'legends', 'weapons'];
	const hash = window.location.hash.substring(1);

	const [activePage, setActivePage] = useState(
		sections.includes(hash) ? hash : 'overview'
	);

	const [loading, setLoading] = useState(true);
	const [playerStats, setPlayerStats] = useState({});

	useEffect(() => {
		setTimeout(() => {
			// setPlayerStats(PlayerStatsGen());
			setPlayerStats(PlayerStats);
			setLoading(false);
		}, 250);
	}, []);

	const section = (() => {
		if (loading) return '';
		switch (activePage) {
			case 'teams':
				return <SectionRanked2v2 teams={playerStats.teams} />;
			case 'legends':
				return (
					<SectionLegends
						legends={playerStats.legends}
						weapons={playerStats.weapons}
					/>
				);
			case 'weapons':
				return <SectionWeapons weapons={playerStats.weapons} />;
			default:
				return (
					<>
						<SectionOverview
							season={playerStats.season}
							best_legend={
								[...playerStats.legends].sort(
									(a, b) => b.season.rating - a.season.rating
								)[0]
							}
						/>
						{playerStats.clan ? (
							<SectionClan clan={playerStats.clan} />
						) : (
							''
						)}
						<SectionOverallStats playerStats={playerStats} />
					</>
				);
		}
	})();

	return (
		<div className='PlayerPage'>
			{loading ? (
				<Loader />
			) : (
				<>
					<Header
						activePage={activePage}
						setActivePage={setActivePage}
						playerStats={playerStats}
					/>
					<main>{section}</main>
				</>
			)}
		</div>
	);
};
