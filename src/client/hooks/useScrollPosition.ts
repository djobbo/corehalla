import { useRef, useLayoutEffect } from 'react';

const isBrowser = typeof window !== `undefined`;

const getScrollPosition = () => (isBrowser ? { x: window.scrollX, y: window.scrollY } : { x: 0, y: 0 });

export const useScrollPosition = (effect, deps, wait) => {
    const position = useRef(getScrollPosition());

    let throttleTimeout = null;

    const callBack = () => {
        const currPos = getScrollPosition();
        effect({ prevPos: position.current, currPos });
        position.current = currPos;
        throttleTimeout = null;
    };

    useLayoutEffect(() => {
        const handleScroll = () => {
            if (wait) {
                if (throttleTimeout === null) {
                    throttleTimeout = setTimeout(callBack, wait);
                }
            } else {
                callBack();
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, deps);
};
