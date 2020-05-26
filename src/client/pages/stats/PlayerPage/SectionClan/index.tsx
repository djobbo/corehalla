import React from 'react';
import { Link } from 'react-router-dom';

import { IClanFormat, IPlayerClanFormat } from 'corehalla.js';

interface Props {
	clan: IPlayerClanFormat;
}

// clan.xp string => number
const SectionOverallStats: React.FC<Props> = ({ clan }) => {
	return (
		<section className='section-overall'>
			<h2 className='section-title'>Clan</h2>
			<Link to={`/stats/clan/${clan.id}`}>{clan.name}</Link> ({clan.xp}{' '}
			xp)
			<p>
				XP in clan: {clan.personalXp} xp (
				{((clan.personalXp / parseInt(clan.xp)) * 100).toFixed(2)}%)
			</p>
		</section>
	);
};

export default SectionOverallStats;
