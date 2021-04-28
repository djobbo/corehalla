import { useEffect, useState } from 'react';

export const useMockData = <T>(url: string, delay = 0): [T | undefined, boolean, boolean] => {
    const [data, setData] = useState<T>();
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        const timeout = setTimeout(async () => {
            setData((await import(`../mockups/${url}`)).default as T);
            setLoading(false);
        }, delay);

        return () => clearTimeout(timeout);
    }, []);

    return [data, isLoading, false];
};
