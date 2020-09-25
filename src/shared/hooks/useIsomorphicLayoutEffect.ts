import { useEffect, useLayoutEffect } from 'react';

const canUseDOM: boolean = !!(
    typeof window !== 'undefined' &&
    typeof window.document !== 'undefined' &&
    typeof window.document.createElement !== 'undefined'
);

export const useIsomorphicLayoutEffect = canUseDOM ? useLayoutEffect : useEffect;
