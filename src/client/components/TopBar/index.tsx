import React from 'react';
import { Link } from 'react-router-dom';

import './styles.scss';

import { Searchbar } from './Searchbar';

import Icon from '@mdi/react';
import { mdiDiscord } from '@mdi/js';

export const TopBar: React.FC = () => {
    return (
        <div className="topbar">
            <div className="topbar-nav">
                <div className="logo">
                    <Link to="/">
                        <img src="/assets/images/logo.png" alt="Logo" />
                    </Link>
                </div>
                <Searchbar />
                <nav>
                    <ul>
                        <li>
                            <Link to="/rankings">Rankings</Link>
                        </li>
                        <li>
                            <a href="/">
                                <Icon path={mdiDiscord} title="Discord" size={1} />
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
};
