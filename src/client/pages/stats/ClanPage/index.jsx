import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './styles.scss';

import Loader from '../../../components/Loader';

import ClanStats from '../../../mockups/ClanStats.json';

export default ({ match }) => {
	const sections = ['teams', 'legends', 'weapons'];
	const hash = window.location.hash.substring(1);

	const [activePage, setActivePage] = useState(
		sections.includes(hash) ? hash : 'overview'
	);

	const [loading, setLoading] = useState(true);
	const [clanStats, setClanStats] = useState({});

	useEffect(() => {
		setTimeout(() => {
			setClanStats(ClanStats);
			console.log(ClanStats);
			setLoading(false);
		}, 250);
	}, []);

	return (
		<div className='PlayerPage'>
			{loading ? (
				<Loader />
			) : (
				<>
					{clanStats.name}
					<h3>Leader</h3>
					<div className='clan-members-container'>
						{clanStats.members.leader.map((member) => (
							<div className='card' key={member.brawlhalla_id}>
								<Link
									to={`/stats/player/${member.brawlhalla_id}`}
								>
									{member.name}
								</Link>
							</div>
						))}
					</div>
					<h3>Officers</h3>
					<div className='clan-members-container'>
						{clanStats.members.officer.map((member) => (
							<div className='card' key={member.brawlhalla_id}>
								<Link
									to={`/stats/player/${member.brawlhalla_id}`}
								>
									{member.name}
								</Link>
							</div>
						))}
					</div>
					<h3>Members</h3>
					<div className='clan-members-container'>
						{clanStats.members.member.map((member) => (
							<div className='card' key={member.brawlhalla_id}>
								<Link
									to={`/stats/player/${member.brawlhalla_id}`}
								>
									{member.name}
								</Link>
							</div>
						))}
					</div>
					<h3>Recruits</h3>
					<div className='clan-members-container'>
						{clanStats.members.recruit.map((member) => (
							<div className='card' key={member.brawlhalla_id}>
								<Link
									to={`/stats/player/${member.brawlhalla_id}`}
								>
									{member.name}
								</Link>
							</div>
						))}
					</div>
				</>
			)}
		</div>
	);
};
