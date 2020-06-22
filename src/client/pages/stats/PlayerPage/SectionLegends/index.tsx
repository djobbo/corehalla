import React, { useState } from 'react';

import './styles.scss';

import Icon from '@mdi/react';
import { mdiSortAscending, mdiSortDescending } from '@mdi/js';

import { Select } from '../../../../components/Select';

import { ILegendStatsFormat, IWeaponStatsFormat, Weapon } from 'corehalla.js';
import { Card } from '../../../../components/Card';

interface Props {
    legends: ILegendStatsFormat[];
    weapons: IWeaponStatsFormat[];
}

export const SectionLegends: React.FC<Props> = ({ legends, weapons }: Props) => {
    const [weaponFilter, setWeaponFilter] = useState<Weapon | ''>('');
    const [sortBy, setSortBy] = useState('');
    const [sortOrder, setSortOrder] = useState(-1);

    return (
        <>
            <section className="section-legend-overview">
                <h2 className="section-title">Wu Shnag</h2>
                <div className="legend-overview">
                    <img
                        src={`/assets/images/icons/legends/Wu Shang.png`}
                        alt="wu_shang"
                        className="legend-icon"
                        width="128px"
                        height="128px"
                    />
                    <div className="stats-container">
                        <p>
                            <span className="stat stat-large">Wu</span>
                        </p>
                        <p>
                            <span className="stat stat-medium">9999</span>
                            <span className="stat-desc"> Elo</span>
                        </p>
                        <p>
                            <span className="stat">9999</span>
                            <span className="stat-desc"> Peak</span>
                        </p>
                        <hr />
                        <p>
                            <span className="stat">9999</span>
                            <span className="stat-desc"> Games </span>
                            <span className="stat">(9998W-1L)</span>
                        </p>
                        <p>
                            <span className="stat">99.99 %</span>
                            <span className="stat-desc"> Winrate</span>
                        </p>
                        <hr />
                    </div>
                </div>
            </section>
            <section className="section-legends">
                <h2 className="section-title">Legends</h2>
                <div className="filters-container">
                    <div>
                        <label htmlFor="filter-select">Weapon</label>
                        <Select<Weapon | ''>
                            options={weapons.map((w) => ({
                                value: w.name,
                                label: w.name,
                            }))}
                            onChange={setWeaponFilter}
                            value={weaponFilter}
                        />
                    </div>
                    <div>
                        <label htmlFor="sortby-select">Sort By</label>
                        <select onChange={(e) => setSortBy(e.target.value)} name="sortby-select">
                            <option value="">Level / XP</option>
                            <option value="matchtime">Time Played</option>
                            <option value="rating">Rating</option>
                            <option value="peak_rating">Peak Rating</option>
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
                {[
                    ...(weaponFilter === ''
                        ? legends
                        : legends.filter((l) =>
                              [l.weapons.weaponOne.name, l.weapons.weaponTwo.name].includes(weaponFilter),
                          )),
                ]
                    .sort((a, b) => {
                        switch (sortBy) {
                            case 'rating':
                                return sortOrder * (a.season.rating - b.season.rating);
                            case 'peak_rating':
                                return sortOrder * (a.season.peak - b.season.peak);
                            case 'matchtime':
                                return sortOrder * (a.matchtime - b.matchtime);
                            default:
                                return sortOrder * (a.xp - b.xp);
                            // TODO: Complete all sort cases
                        }
                    })
                    .map((l, i) => (
                        <Card key={i + Math.random()} delay={0.025 * i}>
                            <img
                                src={`/assets/images/icons/legends/${l.name}.png`}
                                alt={`${l.name}`}
                                className="legend-icon"
                                width="32px"
                                height="32px"
                            />
                            {i + 1}. {l.name} - {l.season.rating} Elo ({l.season.peak} Peak) - Level {l.level} ({l.xp}{' '}
                            xp)
                        </Card>
                    ))}
            </section>
        </>
    );
};
