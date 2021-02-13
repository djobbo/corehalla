// Library imports
import { useState, useEffect } from 'react';

export const useDebounce = <T extends string>(callback: (value: T) => void, delay: number, value: T): void => {
    const [debouncedValue, setDebouncedValue] = useState<T | null>(null);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    useEffect(() => {
        if (!debouncedValue) return;
        callback(debouncedValue);
        setDebouncedValue(null);
    }, [debouncedValue, callback]);
};
