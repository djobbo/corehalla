// Library imports
import { useRef } from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

const isBrowser = typeof window !== `undefined`;

const getScrollPosition = () => (isBrowser ? window.scrollY : 0);

export const useScrollPosition = (
    effect: (pos: { prevScrollPos: number; currScrollPos: number }) => void,
    deps: React.DependencyList,
): void => {
    const position = useRef(getScrollPosition());

    const callBack = () => {
        const currScrollPos = getScrollPosition();
        effect({ prevScrollPos: position.current, currScrollPos });
        position.current = currScrollPos;
    };

    useIsomorphicLayoutEffect(() => {
        window.addEventListener('scroll', callBack);

        return () => window.removeEventListener('scroll', callBack);
    }, deps);
};
