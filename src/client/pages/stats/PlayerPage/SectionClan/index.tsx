import React from 'react';
import { Link } from 'react-router-dom';

import { IClanFormat, IPlayerClanFormat } from 'corehalla.js';

interface Props {
	clan: IPlayerClanFormat;
}

const SectionOverallStats: React.FC<Props> = ({ clan }) => {
	return (
		<section className='section-overall'>
			<h2 className='section-title'>Clan</h2>
			<Link to={`/stats/clan/${clan.id}`}>{clan.name}</Link>
		</section>
	);
};

export default SectionOverallStats;
