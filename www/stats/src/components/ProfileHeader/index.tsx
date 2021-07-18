import { PropsWithChildren, useEffect, useState } from 'react'

import styles from './index.module.scss'

import { IFavorite, useFavorites } from '~providers/FavoritesProvider'

interface Props {
    bannerURI: string
    title: string
    favorite: IFavorite
}

export function ProfileHeader({ bannerURI, title, favorite, children }: PropsWithChildren<Props>): JSX.Element {
    const { isFavorite, addFavorite, removeFavorite, updatedAt } = useFavorites()
    const [isFav, setIsFav] = useState(isFavorite(favorite))

    useEffect(() => {
        setIsFav(isFavorite(favorite))
    }, [updatedAt])

    return (
        <div className={styles.container}>
            <img className={styles.bannerImg} src={bannerURI} alt={`${title}_banner`} />
            <h1 className={styles.title}>{title}</h1>

            {isFav ? (
                <a
                    className={`${styles.addToFavBtn} ${styles.isFav}`}
                    href="#"
                    onClick={(e) => {
                        e.preventDefault()
                        removeFavorite(favorite)
                    }}
                >
                    Remove Favorite
                </a>
            ) : (
                <a
                    className={styles.addToFavBtn}
                    href="#"
                    onClick={(e) => {
                        e.preventDefault()
                        addFavorite(favorite)
                    }}
                >
                    Add Favorite
                </a>
            )}
            <div className={styles.description}>{children}</div>
        </div>
    )
}
