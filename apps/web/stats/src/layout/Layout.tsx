import { Footer } from '@Footer';
import { SideNav } from '@SideNav';
import { useSideNavContext } from '~providers/SideNavProvider';
import styles from '~styles/Layout.module.scss';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

export function Layout({ children }: Props): JSX.Element {
    const { sideNavOpen } = useSideNavContext();

    return (
        <>
            <div className={`${styles.mainLayout} ${sideNavOpen ? styles.sideNavOpen : ''}`}>
                <div>{children}</div>
                <Footer />
            </div>
            <SideNav />
        </>
    );
}
