import styles from './index.module.scss';
import layoutStyles from '~styles/Layout.module.scss';

import Link from 'next/link';
import {
	DiscordIcon,
	GithubIcon,
	InstagramIcon,
	TwitterIcon,
} from '@SocialIcons';
import { ReactNode } from 'react';

interface ISocialLink {
	href: string;
	icon: ReactNode;
}

const socialLinks: ISocialLink[] = [
	{
		href: 'https://twitter.com/Corehalla',
		icon: TwitterIcon,
	},
	{
		href: 'https://github.com/AlfieGoldson/CorehallaNeue',
		icon: GithubIcon,
	},
	{
		href: 'https://instagram.com/Corehalla',
		icon: InstagramIcon,
	},
	{
		href: 'https://discord.gg/eD248ez',
		icon: DiscordIcon,
	},
];

export function Footer() {
	return (
		<div className={styles.footer}>
			<div className={styles.section}>
				<div className={layoutStyles.container}>
					<div className={styles.container}>
						<div className={styles.category}>
							<Link href='/'>
								<a>
									<img
										className={styles.logo}
										src='/images/logo.png'
										alt='Corehalla Logo'
									/>
								</a>
							</Link>
						</div>
						<div className={styles.category}>
							<p className={styles.title}>Social Media</p>
							<p
								className={`${styles.content} ${styles.socials}`}
							>
								{socialLinks.map((l) => (
									<a href={l.href} target='_blank'>
										{l.icon}
									</a>
								))}
							</p>
						</div>
						<div className={styles.category}>
							<p className={styles.title}>About Corehalla</p>
							<p className={styles.content}>
								Corehalla.com is a Brawlhalla stats website
								created by{' '}
								<a
									href='https://twitter.com/AlfieBH_'
									target='_blank'
								>
									Alfie
								</a>
								. Wanna help Corehalla reach it's full
								potential? More info{' '}
								<a
									href='https://github.com/AlfieGoldson/CorehallaNeue'
									target='_blank'
								>
									here
								</a>
								.
							</p>
						</div>
						<div className={styles.category}>
							<p className={styles.title}>Disclaimer</p>
							<p className={styles.content}>
								Visual assets courtesy of Blue Mammoth Games.
								<br />
								Corehalla is neither associated nor endorsed by
								Blue Mammoth Games and doesn't reflect the views
								or opinions of Blue Mammoth Games or anyone
								officially involved in developing Brawlhalla.
								<br />
								Brawlhalla and Blue Mammoth Games are trademarks
								of Blue Mammoth Games.
							</p>
						</div>
					</div>
				</div>
				<div className={styles.section}>
					<div className={styles.copyright}>
						© 2021 Corehalla. By using this site you agree to our{' '}
						<Link href='/terms'>
							<a>Terms of Service</a>
						</Link>{' '}
						and{' '}
						<Link href='/privacy'>
							<a>Privacy Policy</a>
						</Link>
						.
					</div>
				</div>
			</div>
		</div>
	);
}
