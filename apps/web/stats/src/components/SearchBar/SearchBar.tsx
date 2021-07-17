import { useEffect, useState } from 'react';
import { useDebounceValue } from '~hooks/useDebounce';
import { Select } from '@Select';
import styles from './SearchBar.module.scss';

const Loader = () => {
    return (
        <div className={styles.loader}>
            <div />
            <div />
            <div />
            <div />
        </div>
    );
};

export const SearchBar = (): JSX.Element => {
    const [val, setVal, isLoading] = useDebounceValue('', 500);
    const [options, setOptions] = useState([]);

    useEffect(() => {
        if (!val) return;

        setOptions([{ value: '1213456', label: val }]);
    }, [val]);

    return (
        <div className={styles.searchBar}>
            <Select options={options} onInputChange={setVal} placeholder="Search Player..." searchable clearable />
            {isLoading && <Loader />}
        </div>
    );
};
