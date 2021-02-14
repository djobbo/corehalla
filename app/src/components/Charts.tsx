interface Props {
	width?: string;
	height?: string;
	amount: number;
	bg?: string;
	fg?: string;
}

export function BarChart({
	width = '100%',
	height = '0.25rem',
	amount = 0,
	bg = 'var(--bg-2)',
	fg = 'var(--accent)',
}: Props) {
	return (
		<svg
			width={width}
			height={height}
			viewBox='0 0 20 20'
			preserveAspectRatio='none'
		>
			<rect x='0' y='0' width='20' height='20' fill={bg} />
			<rect
				x='0'
				y='0'
				width={(amount / 100) * 20}
				height='20'
				fill={fg}
			/>
		</svg>
	);
}

export function PieChart({
	width = '2rem',
	height = '2rem',
	amount = 0,
	bg = 'var(--bg-2)',
	fg = 'var(--accent)',
}: Props) {
	return (
		<svg width={width} height={height} viewBox='0 0 20 20'>
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
