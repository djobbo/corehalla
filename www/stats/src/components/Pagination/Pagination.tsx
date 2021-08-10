import Link from 'next/link'

import styles from './Pagination.module.scss'

interface Props {
    firstPage?: number
    page: number
    getPageHref: (page: number) => string
    span?: number
}

export const Pagination = ({ page, getPageHref, firstPage = 0, span = 0 }: Props): JSX.Element => {
    return (
        <div className={styles.pagination}>
            {page > firstPage + span && (
                <Link href={getPageHref(firstPage)}>
                    <a className={`${styles.item}  ${styles.link} ${page === firstPage ? styles.active : ''}`}>
                        {firstPage}
                    </a>
                </Link>
            )}
            {page > firstPage + span + 1 && <span className={`${styles.item} ${styles.separator}`}>...</span>}
            {Array.from({ length: 2 * span + 1 }, (_, i) => {
                const _page = page + i - span

                if (_page < firstPage) return null

                return page === _page ? (
                    <span className={`${styles.item} ${styles.active}`}>{_page}</span>
                ) : (
                    <Link href={getPageHref(_page)}>
                        <a className={`${styles.item} ${styles.link}`}>{_page}</a>
                    </Link>
                )
            })}
        </div>
    )
}
