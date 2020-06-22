import React, { FC } from 'react';
interface Props {
    title: string;
    value: string;
}

export const MiscStat: FC<Props> = ({ title, value }: Props) => {
    return (
        <p>
            <span className="title stat-desc">{title}</span>
            <span className="value stat-medium">{value}</span>
        </p>
    );
};
