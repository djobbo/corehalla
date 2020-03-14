import React from 'react';
import { Link } from 'react-router-dom';

function SectionOverallStats({ clan }) {
	return (
		<section className='section-overall'>
			<h2 className='section-title'>Clan</h2>
			<Link to={`/stats/clan/${clan.clan_id}`}>{clan.clan_name}</Link>
		</section>
	);
}

export default SectionOverallStats;
