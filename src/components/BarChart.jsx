import React from 'react';

function BarChart({
	width = '100%',
	height = '0.25rem',
	amount = 0,
	bg = 'var(--bg)',
	fg = 'var(--accent)'
}) {
	return (
		<svg
			className='bar-chart'
			width={width}
			height={height}
			viewBox='0 0 20 20'
			preserveAspectRatio='none'
		>
			<rect x='0' y='0' width='20' height='20' fill={bg} />
			<rect
				className='fill'
				x='0'
				y='0'
				width={(amount / 100) * 20}
				height='20'
				fill={fg}
			/>
		</svg>
	);
}

export default BarChart;
