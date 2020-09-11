// Library imports
import { useRef, useLayoutEffect } from 'react';

const isBrowser = typeof window !== `undefined`;

const getScrollPosition = () =>
    isBrowser
        ? {
              x: window.scrollX,
              y: window.scrollY,
          }
        : { x: 0, y: 0 };

interface IVector2 {
    x: number;
    y: number;
}

export const useScrollPosition = (
    effect: (pos: { prevPos: IVector2; currPos: IVector2 }) => void,
    deps: React.DependencyList,
): void => {
    const position = useRef(getScrollPosition());

    const callBack = () => {
        const currPos = getScrollPosition();
        effect({ prevPos: position.current, currPos });
        position.current = currPos;
    };

    useLayoutEffect(() => {
        window.addEventListener('scroll', callBack);

        return () => window.removeEventListener('scroll', callBack);
    }, deps);
};
