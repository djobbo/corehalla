import Head from 'next/head'
import React from 'react'

import { useTheme } from '~providers/ThemeProvider'
import { ThemeName, themeNames } from '~styles/themes'

import { Container } from '@Container'
import { Footer } from '@Footer'
import { Header } from '@Header'
import { Select } from '@Select'

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
