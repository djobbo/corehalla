import { useEffect, useState } from "react"

export const useDebouncedState = <T>(defaultValue: T, delay: number) => {
    const [value, setValue] = useState(defaultValue)
    const [debouncedValue, setDebouncedValue] = useState<T>(defaultValue)

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(timeout)
        }
    }, [defaultValue, delay, value])

    return [debouncedValue, setValue, value] as const
}
