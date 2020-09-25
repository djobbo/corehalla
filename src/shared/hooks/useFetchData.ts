import { useContext, useEffect, useState } from 'react';
import { SSRContext } from '../providers/SSRProvider';

export const useFetchData = <T>(url: string): [T, boolean, boolean] => {
    const [data, setData] = useState<T>();
    const [isLoading, setLoading] = useState(true);
    const [isError, setError] = useState(false);

    const { ssrContext } = useContext(SSRContext);

    if (ssrContext && ssrContext.errors.length <= 0) {
        return [ssrContext.data, false, false];
    }

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
    }, [url]);

    return [data, isLoading, isError];
};
