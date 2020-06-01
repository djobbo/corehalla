import React from 'react';
import './styles.scss';

export const Loader: React.FC = () => (
    <div className="loader">
        <div className="lds-ellipsis">
            <div />
            <div />
            <div />
            <div />
        </div>
    </div>
);
