import React, { useState } from 'react';

import './styles.scss';

import Icon from '@mdi/react';
import { mdiSortAscending, mdiSortDescending } from '@mdi/js';

import { Ranked2v2Team } from './Ranked2v2Team';
import { I2v2TeamFormat } from 'corehalla.js';

interface Props {
    teams: I2v2TeamFormat[];
}

export const SectionRanked2v2: React.FC<Props> = ({ teams }: Props) => {
    const [rankTierFilter, setRankTierFilter] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [sortOrder, setSortOrder] = useState(-1);

    return (
        <section className="section-2v2">
            <h2 className="section-title">Ranked 2v2</h2>
            <div className="filters-container">
                <div>
                    <label htmlFor="filter-select">Tier</label>
                    <select onChange={(e) => setRankTierFilter(e.target.value)} name="filter-selector">
                        <option value="">Any</option>
                        <option value="Diamond">Diamond</option>
                        <option value="Platinum">Platinum</option>
                        <option value="Gold">Gold</option>
                        <option value="Silver">Silver</option>
                        <option value="Bronze">Bronze</option>
                        <option value="Tin">Tin</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="sortby-select">Sort By</label>
                    <select onChange={(e) => setSortBy(e.target.value)} name="sortby-select">
                        <option value="">Rating</option>
                        <option value="peak_rating">Peak Rating</option>
                        <option value="games">Games</option>
                        <option value="wins">Wins</option>
                        <option value="winrate">Winrate</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="sortby-select">Order</label>
                    {sortOrder === 1 ? (
                        <button onClick={() => setSortOrder(-1)}>
                            <Icon path={mdiSortDescending} title="Sort Ascending" size={1} />
                        </button>
                    ) : (
                        <button onClick={() => setSortOrder(1)}>
                            <Icon path={mdiSortAscending} title="Sort Descending" size={1} />
                        </button>
                    )}
                </div>
            </div>
            <div className="ranked-teams">
                {[
                    ...(rankTierFilter === ''
                        ? teams
                        : teams.filter((l) => l.season.tier.split(' ')[0] === rankTierFilter)),
                ]
                    .sort((a, b) => {
                        switch (sortBy) {
                            case 'peak_rating':
                                return sortOrder * (a.season.peak - b.season.peak);
                            case 'games':
                                return sortOrder * (a.season.games - b.season.games);
                            case 'wins':
                                return sortOrder * (a.season.wins - b.season.wins);
                            case 'winrate':
                                return sortOrder * (a.season.wins / a.season.games - b.season.wins / b.season.games);
                            default:
                                return sortOrder * (a.season.rating - b.season.rating);
                            // TODO: Complete all sort cases
                        }
                    })
                    .map((team, i) => (
                        <Ranked2v2Team key={Math.random()} id={i} team={team} />
                    ))}
            </div>
        </section>
    );
};
