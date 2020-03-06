function formatTime(s) {
	let timeLeft = s;

	let h = Math.floor(timeLeft / 3600);
	timeLeft -= h * 3600;

	let m = Math.floor(timeLeft / 60);
	timeLeft -= m * 60;
	return `${h}h ${m}m ${timeLeft}s`;
}

export default formatTime;
