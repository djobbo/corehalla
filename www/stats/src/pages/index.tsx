import { DiscordIcon } from '@Icons/Social'
import Head from 'next/head'
import Link from 'next/link'

import styles from '~styles/pages/HomePage.module.scss'

import { Container } from '@Container'
import { Footer } from '@Footer'
import { Header } from '@Header'
import { SearchBar } from '@SearchBar'

const HomePage = (): JSX.Element => {
    return (
        <>
            <Head>
                <title>Home • Corehalla</title>
            </Head>
            <Header />
            <div className={styles.landingSections}>
                <Container>
                    <div className={styles.landingContent}>
                        <div className={styles.text}>
                            <h1 className={styles.title}>
                                The heart of <span className={styles.bold}>Valhalla.</span>
                            </h1>
                            <p className={styles.desc}>
                                Welcome to Corehalla !
                                <br /> Brawlhalla Statistics, Rankings, Guides and more...
                            </p>
                            <SearchBar />
                        </div>
                        <div className={styles.landingImg}>
                            <video src="/images/BP4.webm" playsInline autoPlay muted loop />
                        </div>
                    </div>
                </Container>
                <Container>
                    <div className={`${styles.landingContent} ${styles.right}`}>
                        <div className={styles.text}>
                            <h1 className={styles.title}>Join the community</h1>
                            <p className={styles.desc}>Salut jac</p>
                            <Link href="https://discord.corehalla.com">
                                <a target="_blank" className={styles.landingBtn}>
                                    <DiscordIcon width="2rem" height="2rem" /> Join our Discord
                                </a>
                            </Link>
                        </div>
                        <div className={styles.landingImg}>
                            <video src="/images/BP3.webm" playsInline autoPlay muted loop />
                        </div>
                    </div>
                </Container>
            </div>
            <Footer />
        </>
    )
}

export default HomePage
