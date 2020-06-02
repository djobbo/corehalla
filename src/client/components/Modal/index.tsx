import React, { useState } from 'react';

import './styles.scss';

interface Props {
    show: boolean;
    children: React.ReactNode;
}

export const Modal: React.FC<Props> = ({ show, children }: Props) => {
    return (
        show && (
            <div className="modal-container">
                <div className="content card">{children}</div>
            </div>
        )
    );
};
