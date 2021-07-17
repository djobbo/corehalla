import { Container } from '@Container'
import { Footer } from '@Footer'
import { Header } from '@Header'
import Head from 'next/head'
import React from 'react'
import { Select } from '@Select'
import { useTheme } from '~providers/ThemeProvider'
import { themeNames, ThemeName } from '~styles/themes'

const DashboardPage = (): JSX.Element => {
    const { setThemeName, themeName } = useTheme()

    return (
        <>
            <Head>
                <title>Dashboard • Corehalla</title>
            </Head>
            <Header />
            <Container>
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

export default DashboardPage
