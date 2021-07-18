import { Option, Select } from '@Select'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { useDebounceValue } from '~hooks/useDebounce'

import { IRanking1v1Format } from '../../../../../packages/core/types'
import styles from './SearchBar.module.scss'

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
    const [val, setVal, isLoading] = useDebounceValue('', 500)
    const [options, setOptions] = useState([])

    const router = useRouter()

    const handleChange = (playerId: string) => {
        console.log({ playerId })
        if (!playerId) return

        router.push(`/stats/player/${playerId}`)
    }

    useEffect(() => {
        if (!val) return
        ;(async () => {
            try {
                const res = await fetch('/api/rankings/1v1/ALL/1')
                const data = (await res.json()) as IRanking1v1Format[]
                setOptions(data.map<Option<string>>((player) => ({ value: player.id.toString(), label: player.name })))
            } catch {}
        })()

        setOptions([{ value: '1213456', label: val }])
    }, [val])

    return (
        <div className={styles.searchBar}>
            <Select
                options={options}
                onInputChange={setVal}
                placeholder="Search Player..."
                onChange={handleChange}
                searchable
                clearable
            />
            {isLoading && <Loader />}
        </div>
    )
}
