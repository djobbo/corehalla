import React, { useState, useEffect, FC } from 'react';
import { Link } from 'react-router-dom';
import './styles.scss';

import { Loader } from '../../../components/Loader';

import { IClanFormat } from 'corehalla.js';
import { Card } from '../../../components/Card';

export const ClanStatsPage: FC = () => {
    const sections = ['teams', 'legends', 'weapons'];
    const hash = window.location.hash.substring(1);

    const [,] = useState(sections.includes(hash) ? hash : 'overview');

    const [loading, setLoading] = useState(true);
    const [clanStats, setClanStats] = useState<IClanFormat>();

    useEffect(() => {
        const timeout = setTimeout(async () => {
            const { ClanStats } = await import('../../../mockups/Clan');
            setClanStats(ClanStats);
            setLoading(false);
        }, 250);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="PlayerPage">
            {loading ? (
                <Loader />
            ) : (
                <>
                    {clanStats.name}
                    <h3>Leader</h3>
                    <div className="clan-members-container">
                        {clanStats.members.Leader.map((member) => (
                            <Card key={member.id}>
                                <Link to={`/stats/player/${member.id}`}>{member.name}</Link>
                            </Card>
                        ))}
                    </div>
                    <h3>Officers</h3>
                    <div className="clan-members-container">
                        {clanStats.members.Officer.map((member) => (
                            <Card key={member.id}>
                                <Link to={`/stats/player/${member.id}`}>{member.name}</Link>
                            </Card>
                        ))}
                    </div>
                    <h3>Members</h3>
                    <div className="clan-members-container">
                        {clanStats.members.Member.map((member) => (
                            <Card key={member.id}>
                                <Link to={`/stats/player/${member.id}`}>{member.name}</Link>
                            </Card>
                        ))}
                    </div>
                    <h3>Recruits</h3>
                    <div className="clan-members-container">
                        {clanStats.members.Recruit.map((member) => (
                            <Card key={member.id}>
                                <Link to={`/stats/player/${member.id}`}>{member.name}</Link>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
