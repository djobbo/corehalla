import styles from '@styles/Article.module.scss';
import { Layout } from './Layout';

interface Props {
	title: string;
	subtitle: string;
}

export function ArticleLayout({ title, subtitle }: Props) {
	return (
		<Layout>
			<div className={styles.article}>
				<h1 className={styles.title}>
					{title}
					<span className={styles.subtitle}>{subtitle}</span>
				</h1>
			</div>
		</Layout>
	);
}
