import { useEffect, useState } from "react"

export const useLocalStorageState = <T>(
    key: string,
    initialValue: T,
    ssrInitialValue?: T,
) => {
    const [storedValue, setStoredValue] = useState<T>(
        ssrInitialValue ?? initialValue,
    )

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore =
                value instanceof Function ? value(storedValue) : value

            setStoredValue(valueToStore)

            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(valueToStore))
            }
        } catch (error) {
            // Error saving data
        }
    }

    useEffect(() => {
        if (typeof window === "undefined") {
            return
        }

        try {
            const item = window.localStorage.getItem(key)
            setStoredValue(item ? JSON.parse(item) : initialValue)
        } catch (error) {
            // Error retrieving data
        }

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === key) {
                setStoredValue(JSON.parse(event.newValue ?? ""))
            }
        }

        window.addEventListener("storage", handleStorageChange)

        return () => {
            window.removeEventListener("storage", handleStorageChange)
        }
    }, [key])

    return [storedValue, setValue] as const
}
