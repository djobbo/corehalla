import styles from './Card.module.scss';
import { motion } from 'framer-motion';
import { PropsWithChildren } from 'react';

interface Props {
    title?: string;
    className?: string;
}

export const Card = ({ title, children, className }: PropsWithChildren<Props>): JSX.Element => {
    return (
        <motion.div className={`${styles.card} ${className ?? ''}`}>
            {title && <span className={styles.title}>{title}</span>}
            {children}
        </motion.div>
    );
};
