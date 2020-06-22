import React from 'react';

import { Card } from '../Card';

import './styles.scss';

interface Props {
    show: boolean;
    children: React.ReactNode;
}

export const Modal: React.FC<Props> = ({ show, children }: Props) => {
    return (
        show && (
            <div className="modal-container">
                <Card className="content">{children}</Card>
            </div>
        )
    );
};
