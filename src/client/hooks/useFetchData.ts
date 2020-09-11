import { useEffect, useState } from 'react';

export const useFetchData = <T>(url: string): [T, boolean, boolean] => {
    const [data, setData] = useState<T>();
    const [isLoading, setLoading] = useState(true);
    const [isError, setError] = useState(false);

    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        fetch(url, { signal })
            .then(async (res) => {
                setData((await res.json()) as T);
                setLoading(false);
            })
            .catch(() => {
                setError(true);
            });

        return () => abortController.abort();
    }, []);

    return [data, isLoading, isError];
};
