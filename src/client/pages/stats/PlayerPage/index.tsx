import React, { useState, useEffect } from 'react';
import { RouteChildrenProps } from 'react-router-dom';
import './styles.scss';

import Header, { Page } from './Header';
import SectionOverview from './SectionOverview';
import SectionOverallStats from './SectionOverallStats';
import SectionRanked2v2 from './SectionRanked2v2';
import SectionLegends from './SectionLegends';
import SectionWeapons from './SectionWeapons';
import SectionClan from './SectionClan';

import { IPlayerStatsFormat } from 'corehalla.js';

import Loader from '../../../components/Loader';

interface Props extends RouteChildrenProps<{ id: string }> {}

const PlayerPage: React.FC<Props> = ({ match }) => {
	const sections = ['teams', 'legends', 'weapons'];
	const hash = window.location.hash.substring(1);

	const [activePage, setActivePage] = useState<Page>(
		sections.includes(hash) ? (hash as Page) : 'overview'
	);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [playerStats, setPlayerStats] = useState<IPlayerStatsFormat>();

	useEffect(() => {
		// const { PlayerStats } = await import('../../../mockups/Player');
		fetch(`/api/stats/player/${match.params.id}`)
			.then(async (res) => {
				const data = (await res.json()) as IPlayerStatsFormat;
				setPlayerStats(data);
				setLoading(false);
			})
			.catch((e) => {
				setError(true);
			});
	}, []);

	const section = (() => {
		if (loading) return '';
		switch (activePage) {
			case 'teams':
				return <SectionRanked2v2 teams={playerStats.season.teams} />;
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

export default PlayerPage;
