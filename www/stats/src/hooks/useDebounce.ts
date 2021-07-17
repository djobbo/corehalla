import { SetStateAction } from 'react'
import { DependencyList } from 'react'
import { Dispatch } from 'react'
import { useState, useEffect } from 'react'

export const useDebounce = (fn: () => void, delay = 0, ...deps: DependencyList): void => {
    useEffect(() => {
        const timer = setTimeout(() => {
            fn()
        }, delay)

        return () => {
            clearTimeout(timer)
        }
    }, [fn, delay, deps])

    return
}

export const useDebounceValue = <T>(
    defaultValue: T,
    delay = 0,
): [value: T, setValue: Dispatch<SetStateAction<T>>, loading: boolean] => {
    const [value, setValue] = useState<T>(defaultValue)
    const [debouncedValue, setDebouncedValue] = useState<T>(defaultValue)

    const updateValue = () => {
        setDebouncedValue(value)
    }

    useDebounce(updateValue, delay, value)

    return [debouncedValue, setValue, value !== debouncedValue]
}