import { FC } from 'react';

export interface ChartProps {
    width?: string;
    height?: string;
    amount: number;
    bg?: string;
    fg?: string;
}

export type Chart = FC<ChartProps>;
