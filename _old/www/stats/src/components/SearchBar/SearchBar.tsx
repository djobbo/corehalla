import { useRouter } from 'next/router'

import styles from './SearchBar.module.scss'

import { useSearch } from '~providers/SearchProvider'

import { Select } from '@Select'

const Loader = () => {
    return (
        <div className={styles.loader}>
            <div />
            <div />
            <div />
            <div />
        </div>
    )
}

export const SearchBar = (): JSX.Element => {
    const { setSearch, isLoading, options } = useSearch()

    const router = useRouter()

    const handleChange = (playerId: string) => {
        if (!playerId) return

        router.push(`/stats/player/${playerId}`)
    }

    return (
        <div className={styles.searchBar}>
            <Select
                options={options}
                onInputChange={setSearch}
                placeholder="Search Player..."
                onChange={handleChange}
                searchable
                clearable
                dropIndicator={false}
            />
            {isLoading && <Loader />}
        </div>
    )
}
