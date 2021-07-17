import { Dispatch } from 'react'
import { SetStateAction } from 'react'
import { createContext, useState, useContext, ReactNode, useEffect } from 'react'
import { themes, ThemeName, themeNames } from '~styles/themes'

interface ThemeContext {
    themeName: ThemeName
    setThemeName: Dispatch<SetStateAction<ThemeName>>
}

const themeContext = createContext<ThemeContext>({
    themeName: 'default',
    setThemeName: () => ({}),
})

export const useTheme = (): ThemeContext => useContext(themeContext)

interface Props {
    children: ReactNode
}

export const ThemeProvider = ({ children }: Props): JSX.Element => {
    const [themeName, setThemeName] = useState<ThemeName>('default')

    useEffect(() => {
        const onStorageChange = ({ key, newValue }: StorageEvent) => {
            console.log(`Key Changed: ${key}`)
            console.log(`New Value: ${newValue}`)

            if (key !== 'theme') return

            setThemeName(themeNames.includes(newValue as ThemeName) ? (newValue as ThemeName) : 'default')
        }

        const savedTheme: ThemeName = (localStorage.getItem('theme') as ThemeName) ?? 'default'
        setThemeName(themeNames.includes(savedTheme) ? savedTheme : 'default')

        window.addEventListener('storage', onStorageChange)

        return () => {
            window.removeEventListener('storage', onStorageChange)
        }
    }, [])

    useEffect(() => {
        console.log({ themeName })
        if (!themeName) return

        localStorage.setItem('theme', themeName)

        const theme = themes[themeName]

        if (!theme) return

        Object.entries(theme).forEach(([prop, value]) => {
            document.documentElement.style.setProperty(`--${prop}`, value)
        })
    }, [themeName])

    return <themeContext.Provider value={{ themeName, setThemeName }}>{children}</themeContext.Provider>
}
