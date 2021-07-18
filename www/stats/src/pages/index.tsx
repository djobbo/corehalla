import Head from 'next/head'
import Link from 'next/link'

import styles from '~styles/pages/HomePage.module.scss'

import { Container } from '@Container'
import { Header } from '@Header'
import { SearchBar } from '@SearchBar'
import { DiscordIcon } from '@SocialIcons'
import { StatDesc, StatSmall } from '@TextStyles'

const HomePage = (): JSX.Element => {
    return (
        <>
            <Head>
                <title>Index • Corehalla</title>
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
                            <video
                                src="/images/Brynn_BP3_Landing.webm"
                                width="100%"
                                height="100%"
                                playsInline
                                autoPlay
                                muted
                                loop
                            />
                        </div>
                    </div>
                </Container>
                <div className={styles.mainContent}>
                    <Container>
                        <img src="/images/Landing_Preview.jpg" className={styles.landingPreview} />
                    </Container>
                    <Container>
                        <div className={styles.blips}>
                            <div className={styles.blip}>
                                <StatSmall>Rankings</StatSmall>
                                <br />
                                <StatDesc>
                                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. At, itaque excepturi eius
                                    repellendus atque.
                                </StatDesc>
                            </div>
                            <div className={styles.blip}>
                                <StatSmall>Player Stats</StatSmall>
                                <br />
                                <StatDesc>
                                    Lorem ipsum dolor, sit amet consectetur adipisicing elit. Vel perspiciatis incidunt
                                    odio sit.
                                </StatDesc>
                            </div>
                            <div className={styles.blip}>
                                <StatSmall>Clan Stats</StatSmall>
                                <br />
                                <StatDesc>
                                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus facere natus
                                    animi ut.
                                </StatDesc>
                            </div>
                        </div>
                    </Container>
                </div>
                <Container>
                    <div className={`${styles.landingContent} ${styles.right} ${styles.card}`}>
                        <div className={styles.text}>
                            <h1 className={styles.title}>Join the community</h1>
                            <p className={styles.desc}>Salut jac</p>
                            <Link href="https://discord.corehalla.com">
                                <a target="_blank" className={styles.landingBtn}>
                                    {DiscordIcon} Join our Discord
                                </a>
                            </Link>
                        </div>
                        <div className={styles.landingImg}>
                            <img src="/images/Nix Landing.webp" alt="" width="100%" height="100%" />
                        </div>
                    </div>
                </Container>
            </div>
        </>
    )
}

export default HomePage
