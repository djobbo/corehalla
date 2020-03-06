import React from 'react';
import BarChart from '../../../../components/BarChart';

function Ranked2v2Team({
	name = '',
	id,
	tier = 'Tin 0',
	rating = '750',
	peak_rating = '750',
	games = 0,
	wins = 0,
	losses = 0,
	winrate = '0',
	region = 'N/A'
}) {
	return (
		<div
			className='card ranked-team'
			style={{ '--delay': `${0.05 * parseInt(id)}s` }}
		>
			<h3>
				<img
					src={`/assets/images/icons/flags/${region}.png`}
					alt={`${region}_icon`}
				/>
				{name}
			</h3>
			<div className='stats-container'>
				<img
					style={{ '--delay': `${0.05 * parseInt(id)}s` }}
					src={`/assets/images/icons/ranked/${tier}.png`}
					alt={`${tier}_icon`}
				/>
				<div>
					<p>
						<span>{rating} </span>
						<span>Rating</span>
					</p>
					<p>
						<span>{peak_rating} </span>
						<span>Peak</span>
					</p>
					<p>
						<span>{winrate}% </span>
						<span>Winrate</span>
					</p>
					<p>
						<span>{games} </span>
						<span>Games</span>
					</p>
				</div>
			</div>
			<BarChart amount={winrate} height='1rem' />
		</div>
	);
}

export default Ranked2v2Team;
