import React, { useState, useEffect } from 'react';
import './PlayerPage/styles.css';

import Header from './PlayerPage/Header';
import SectionOverview from './PlayerPage/SectionOverview';
import SectionOverallStats from './PlayerPage/SectionOverallStats';
import SectionRanked2v2 from './PlayerPage/SectionRanked2v2';
import SectionLegends from './PlayerPage/SectionLegends';
import SectionWeapons from './PlayerPage/SectionWeapons';

import Loader from '../../components/Loader';

// import PlayerStatsGen from '../../mockups/PlayerStats.mock';
import PlayerStats from '../../mockups/PlayerStats.json';

export default ({ match }) => {
	const sections = ['teams', 'legends', 'weapons'];
	const hash = window.location.hash.substring(1);

	const [activePage, setActivePage] = useState(
		sections.includes(hash) ? hash : 'overview'
	);

	const [loading, setLoading] = useState(true);
	const [loadingFailed, setLoadingFailed] = useState(false);
	const [playerStats, setPlayerStats] = useState({});

	useEffect(() => {
		setTimeout(() => {
			// setPlayerStats(PlayerStatsGen());
			setPlayerStats(PlayerStats);
			setLoading(false);
		}, 250);
	}, []);

	const section = (() => {
		if (loading) return <></>;
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
