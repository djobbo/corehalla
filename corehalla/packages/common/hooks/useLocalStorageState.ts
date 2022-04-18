import { useEffect, useState } from "react"
import type { Dispatch, SetStateAction } from "react"

type NotFunction<T> = T extends (...args: unknown[]) => unknown ? never : T

export const useLocalStorageState = <T>(
    key: string,
    initialValue: NotFunction<T>,
) => {
    const [storedValue, setStoredValue] = useState<T>(initialValue)

    useEffect(() => {
        const localStorageValue = localStorage.getItem(key)
        setStoredValue(
            localStorageValue ? JSON.parse(localStorageValue) : initialValue,
        )
    }, [key])

    useEffect(() => {
        const storageListener = (e: StorageEvent) => {
            if (e.storageArea !== localStorage || e.key !== key) return
            setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue)
        }

        window.addEventListener("storage", storageListener)

        return () => {
            window.removeEventListener("storage", storageListener)
        }
    }, [initialValue, key])

    const setValue: Dispatch<SetStateAction<NotFunction<T>>> = (
        newValueSetter,
    ) => {
        const newValue: NotFunction<T> =
            typeof newValueSetter === "function"
                ? // @ts-expect-error function type
                  newValueSetter(storedValue)
                : newValueSetter
        setStoredValue(newValue)
        localStorage.setItem(key, JSON.stringify(newValue))
    }

    return [storedValue, setValue] as const
}
