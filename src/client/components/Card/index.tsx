import React, { CSSProperties } from 'react';

interface Props {
    className?: string;
    children: React.ReactNode;
    delay?: number;
}

export const Card: React.FC<Props> = ({ children, className = '', delay = 0 }: Props) => {
    return (
        <div className={`card ${className}`} style={{ '--delay': `${delay}s` } as CSSProperties}>
            {children}
        </div>
    );
};
