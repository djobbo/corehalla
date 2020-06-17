import React, { useState } from 'react';

import './styles.scss';

import Icon from '@mdi/react';
import { mdiSortAscending, mdiSortDescending } from '@mdi/js';

import { Ranked2v2Team } from './Ranked2v2Team';
import { I2v2TeamFormat } from 'corehalla.js';
import { PieChart } from '../../../../components/Charts/PieChart';
import { MiscStat } from '../../../../components/MiscStat';

interface Props {
    teams: I2v2TeamFormat[];
}

export const SectionRanked2v2: React.FC<Props> = ({ teams }: Props) => {
    const [rankTierFilter, setRankTierFilter] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [sortOrder, setSortOrder] = useState(-1);

    return (
        <>
            <section className="section-2v2-overview">
                <h2 className="section-title">2v2 Overview</h2>
                {/* TODO: move this to corehalla.js */}
                <Ranked2v2TotalGames
                    {...teams.reduce(
                        (acc, team) => ({
                            games: acc.games + team.season.games,
                            wins: acc.wins + team.season.wins,
                            ratingAcc: acc.ratingAcc + team.season.rating,
                            peakAcc: acc.peakAcc + team.season.peak,
                            ratingAccPond: {
                                rating: acc.ratingAccPond.rating + team.season.games * team.season.peak,
                                peak: acc.ratingAccPond.peak + team.season.games * team.season.rating,
                                total: acc.ratingAccPond.total + team.season.games,
                            },
                            winrateAcc: acc.winrateAcc + team.season.wins / team.season.games,
                        }),
                        {
                            games: 0,
                            wins: 0,
                            ratingAcc: 0,
                            peakAcc: 0,
                            ratingAccPond: { rating: 0, peak: 0, total: 0 },
                            winrateAcc: 0,
                        },
                    )}
                    teamCount={teams.length}
                />
            </section>
            <section className="section-2v2-teams">
                <h2 className="section-title">Teams</h2>
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
                                    return (
                                        sortOrder * (a.season.wins / a.season.games - b.season.wins / b.season.games)
                                    );
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
        </>
    );
};

function Ranked2v2TotalGames({
    teamCount,
    games,
    wins,
    ratingAcc,
    peakAcc,
    ratingAccPond,
    winrateAcc,
}: {
    teamCount: number;
    games: number;
    wins: number;
    ratingAcc: number;
    peakAcc: number;
    ratingAccPond: { rating: number; peak: number; total: number };
    winrateAcc: number;
}) {
    return (
        <>
            <div className="stats-container">
                <div className="card games-stats">
                    <div className="games-stats-container">
                        <div>
                            <h3>Games</h3>
                            <p>
                                <span className="stat stat-large">{games}</span>
                                <span className="stat-desc"> Games</span>
                            </p>
                            <p>
                                <span className="stat">{wins}</span>
                                <span className="stat-desc"> Wins</span>
                            </p>
                            <p>
                                <span className="stat">{games - wins}</span>
                                <span className="stat-desc"> Losses</span>
                            </p>
                            <p>
                                <span className="stat">{((wins / games) * 100).toFixed(1)}%</span>
                                <span className="stat-desc"> Winrate</span>
                            </p>
                        </div>
                        <div className="games-pie-chart">
                            <PieChart width="12rem" height="12rem" amount={(wins / games) * 100} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="misc-general-stats">
                <MiscStat title="Avg. Games" value={(games / teamCount).toFixed(0)} />
                <MiscStat title="Avg. Wins" value={(wins / teamCount).toFixed(0)} />
                <MiscStat title="Avg. Losses" value={((games - wins) / teamCount).toFixed(0)} />
                <MiscStat title="Avg. Winrate" value={`${((winrateAcc / teamCount) * 100).toFixed(2)}%`} />
                <MiscStat title="Avg. Rating" value={(ratingAcc / teamCount).toFixed(0)} />
                <MiscStat title="Avg. Pond. Rating" value={(ratingAccPond.rating / ratingAccPond.total).toFixed(0)} />
                <MiscStat title="Avg. Peak" value={(peakAcc / teamCount).toFixed(0)} />
                <MiscStat title="Avg. Pond. Peak" value={(ratingAccPond.peak / ratingAccPond.total).toFixed(0)} />
            </div>
        </>
    );
}
