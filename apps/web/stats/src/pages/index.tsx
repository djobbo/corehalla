import styles from '~styles/pages/HomePage.module.scss';
import layoutStyles from '~styles/Layout.module.scss';
// Library imports
import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { StatSmall, StatDesc } from '@TextStyles';

// Components imports
import { usePlayerSearchContext } from '~providers/PlayerSearchProvider';
import { useViewportScroll } from 'framer-motion';
import { Layout } from '~layout/Layout';
import { useSideNavContext } from '~providers/SideNavProvider';
import { DiscordIcon } from '~components/SocialIcons';

export default function HomePage(): JSX.Element {
    const { scrollY } = useViewportScroll();
    const { setPlayerSearch } = usePlayerSearchContext();
    const [hasScrolled, setHasScrolled] = useState(scrollY.get() > 0);
    const { sideNavOpen } = useSideNavContext();

    scrollY.onChange(() => {
        setHasScrolled(scrollY.get() > 0);
    });

    return (
        <>
            <Layout>
                <Head>
                    <title>Index • Corehalla</title>
                </Head>
                <div
                    className={`${styles.landingNavbar} ${hasScrolled ? styles.hasScrolled : ''} ${
                        sideNavOpen ? styles.sideNavOpen : ''
                    }`}
                >
                    <Link href="/">
                        <a>
                            <img className={styles.mainLogo} src="/images/logo.png" alt="Corehalla Logo" />
                        </a>
                    </Link>
                    <ul>
                        <Link href="/">Home</Link>
                        <Link href="/rankings">Rankings</Link>
                        <Link href="/favorites">Favorites</Link>
                        <Link href="#">
                            <a className={styles.navCTA}>Login</a>
                        </Link>
                    </ul>
                </div>
                <div className={styles.landingSections}>
                    <div className={layoutStyles.container}>
                        <div className={styles.landingContent}>
                            <div className={styles.text}>
                                <h1 className={styles.title}>
                                    The heart of <span className={styles.bold}>Valhalla.</span>
                                </h1>
                                <p className={styles.desc}>
                                    Welcome to Corehalla !
                                    <br /> Brawlhalla Statistics, Rankings, Guides and more...
                                </p>
                                <input
                                    className={styles.searchInput}
                                    type="text"
                                    onChange={(e) => setPlayerSearch(e.target.value)}
                                    placeholder="Search Player..."
                                />
                            </div>
                            <div className={styles.landingImg}>
                                <img src="/images/Brynn_BP3_Landing.gif" alt="" width="50%" height="auto" />
                            </div>
                        </div>
                    </div>
                    <div className={styles.mainContent}>
                        <div className={layoutStyles.container}>
                            <img src="/images/Landing_Preview.png" className={styles.landingPreview} />
                        </div>
                        <div className={layoutStyles.container}>
                            <div className={styles.blips}>
                                <div className={styles.blip}>
                                    <StatSmall>Rankings</StatSmall>
                                    <br />
                                    <StatDesc>
                                        Lorem ipsum dolor sit, amet consectetur adipisicing elit. At, itaque excepturi
                                        eius repellendus atque.
                                    </StatDesc>
                                </div>
                                <div className={styles.blip}>
                                    <StatSmall>Player Stats</StatSmall>
                                    <br />
                                    <StatDesc>
                                        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Vel perspiciatis
                                        incidunt odio sit.
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
                        </div>
                    </div>
                    <div className={layoutStyles.container}>
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
                                <img src="/images/Nix Landing.png" alt="" width="50%" height="auto" />
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
}
