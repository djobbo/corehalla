import { Container } from '@Container'
import { Footer } from '@Footer'
import { Header } from '@Header'
import Head from 'next/head'
import React from 'react'
import { Select } from '@Select'
import { useTheme } from '~providers/ThemeProvider'
import { themeNames, ThemeName } from '~styles/themes'

const SettingsPage = (): JSX.Element => {
    const { setThemeName, themeName } = useTheme()

    return (
        <>
            <Head>
                <title>Dashboard • Corehalla</title>
            </Head>
            <Header />
            <Container>
                <h1>Settings</h1>
                <Select<ThemeName>
                    options={themeNames.map((themeName) => ({ value: themeName }))}
                    onChange={(value) => setThemeName(value)}
                    defaultValue={{ value: themeName }}
                />
            </Container>
            <Footer />
        </>
    )
}

export default SettingsPage
