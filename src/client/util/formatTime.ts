export const formatTime = (s: number): string => {
	let timeLeft = s;

	const h = Math.floor(timeLeft / 3600);
	timeLeft -= h * 3600;

	const m = Math.floor(timeLeft / 60);
	timeLeft -= m * 60;
	return `${h}h ${m}m ${timeLeft}s`;
};
