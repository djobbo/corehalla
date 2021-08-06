import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import styles from './MobileNav.module.scss'

import { SearchBar } from '@SearchBar'
import { SideNav } from '@SideNav'

interface Props {
    open: boolean
}

export const MobileNav = ({ open = false }: Props): JSX.Element => {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return mounted && open
        ? createPortal(
              <div className={styles.mobileNav}>
                  <SideNav />
                  <div className={styles.content}>
                      <SearchBar />
                  </div>
              </div>,
              document.getElementById('mobilenav'),
          )
        : null
}
