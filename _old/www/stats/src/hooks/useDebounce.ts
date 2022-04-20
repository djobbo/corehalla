import { DependencyList, Dispatch, SetStateAction, useEffect, useState } from 'react'

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
): [value: T, debouncedValue: T, setValue: Dispatch<SetStateAction<T>>, loading: boolean] => {
    const [value, setValue] = useState<T>(defaultValue)
    const [debouncedValue, setDebouncedValue] = useState<T>(defaultValue)

    const updateValue = () => {
        setDebouncedValue(value)
    }

    useDebounce(updateValue, delay, value)

    return [value, debouncedValue, setValue, value !== debouncedValue]
}
