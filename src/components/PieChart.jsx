import React from 'react';

function PieChart({
	width = '2rem',
	height = '2rem',
	amount = 0,
	bg = 'var(--bg)',
	fg = 'var(--accent)'
}) {
	return (
		<svg
			className='pie-chart'
			width={width}
			height={height}
			viewBox='0 0 20 20'
		>
			<circle r='10' cx='10' cy='10' fill={bg} />
			<circle
				r='5'
				cx='10'
				cy='10'
				fill='transparent'
				stroke={fg}
				strokeWidth='10'
				strokeDasharray={`calc(${amount} * 31.4 / 100) 31.4`}
				transform='rotate(-90) translate(-20)'
			/>
		</svg>
	);
}

export default PieChart;
