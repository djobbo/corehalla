import styles from './TextStyles.module.scss';
import { DetailedHTMLProps, HTMLAttributes } from 'react';

const Stat = (statType: string) => (
	props: DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>
) => <span className={styles[statType]} {...props} />;

export const StatSmall = Stat('statSmall');
export const StatMedium = Stat('statMedium');
export const StatLarge = Stat('statLarge');
export const StatDesc = Stat('statDesc');
