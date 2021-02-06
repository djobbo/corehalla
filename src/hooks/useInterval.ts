import { useRef, useEffect } from 'react';
function useInterval(callback: () => void, delay: number | null) {
	const savedCallback = useRef<() => void | null>();
	useEffect(() => {
		savedCallback.current = callback;
	});
	useEffect(() => {
		function tick() {
			if (typeof savedCallback?.current !== 'undefined') {
				savedCallback?.current();
			}
		}
		if (delay !== null) {
			const id = setInterval(tick, delay);
			return () => clearInterval(id);
		}
	}, [delay]);
}
export default useInterval;
