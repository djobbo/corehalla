import Head from 'next/head'
import React from 'react'

import { useAuth } from '~providers/AuthProvider'
import { useTheme } from '~providers/ThemeProvider'
import { ThemeName, themeNames } from '~styles/themes'

import { Container } from '@Container'
import { Footer } from '@Footer'
import { Header } from '@Header'
import { Select } from '@Select'

const SettingsPage = (): JSX.Element => {
    const { setThemeName, themeName } = useTheme()

    const { discord3rdPartyApps } = useAuth()

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
            <Container>
                {discord3rdPartyApps.map((app) => (
                    <div key={app.id}>
                        <h2>{app.type}</h2>
                        {app.name}
                    </div>
                ))}
            </Container>
            <Footer />
        </>
    )
}

export default SettingsPage
