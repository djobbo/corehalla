import { ReactNode } from 'react'

import styles from '~styles/Article.module.scss'

import { ArticleNavbar } from '@ArticleNavbar'

import { Layout } from './Layout'

interface Props {
    title: string
    subtitle: string
    children?: ReactNode
}

export function ArticleLayout({ title, subtitle, children }: Props): JSX.Element {
    return (
        <Layout>
            <ArticleNavbar />
            <article className={styles.article}>
                <h1 className={styles.title}>
                    {title}
                    <span className={styles.subtitle}>{subtitle}</span>
                </h1>
                {children ?? <div className={styles.content}>{children}</div>}
            </article>
        </Layout>
    )
}
