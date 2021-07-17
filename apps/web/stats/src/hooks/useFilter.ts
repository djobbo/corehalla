import { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

type FilterFn<Filter extends string = string, T = unknown> = (filter: Filter) => (item: T) => boolean;

export const useFilter = <Filter extends string = string, T = unknown>(
    filterFn: FilterFn<Filter, T>,
): [(array: T[]) => T[], Dispatch<SetStateAction<Filter>>] => {
    const { query } = useRouter();
    const [activeFilter, setActiveFilter] = useState<Filter>((query.filter ?? null) as Filter);

    useEffect(() => {
        setActiveFilter((query.filter ?? null) as Filter);
    }, [query.filter]);

    const filter = (array: T[]): T[] => (activeFilter ? array.filter(filterFn(activeFilter)) : array);

    return [filter, setActiveFilter];
};
