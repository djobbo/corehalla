import styles from './Card.module.scss';
import { motion } from 'framer-motion';
import { PropsWithChildren } from 'react';

interface Props {
    title?: string;
}

export const Card = ({ title, children }: PropsWithChildren<Props>): JSX.Element => {
    return (
        <motion.div className={styles.card}>
            {title && <span className={styles.title}>{title}</span>}
            <div>{children}</div>
        </motion.div>
    );
};
