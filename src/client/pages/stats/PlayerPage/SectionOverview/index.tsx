import React from 'react';

import './styles.scss';
import { IPlayerSeasonFormat, ILegendStatsFormat } from 'corehalla.js';

interface Props {
    season: IPlayerSeasonFormat;
    bestLegend: ILegendStatsFormat;
}

export const SectionOverview: React.FC<Props> = ({ season, bestLegend }) => {
    return (
        <section className="section-overview">
            <h2 className="section-title">Season Overview</h2>
            <div className="ranked-overview-display">
                <div className="ranked-overall">
                    <RankedStats
                        tier={season.tier}
                        rating={season.rating}
                        peak={season.peak}
                        games={season.games}
                        wins={season.wins}
                        losses={season.games - season.wins}
                        winrate={((season.wins / season.games) * 100).toFixed(1)}
                        region={season.region}
                    />
                </div>
                <img src={`/assets/images/ranked-banners/${season.tier}.png`} alt="" className="main-ranked-banner" />
                <div className="ranked-best-legend">
                    <BestLegendRankedStats
                        legend={bestLegend.name}
                        rating={bestLegend.season.rating}
                        peak={bestLegend.season.peak}
                        games={bestLegend.season.games}
                        wins={bestLegend.season.wins}
                        losses={bestLegend.season.games - bestLegend.season.wins}
                        winrate={((bestLegend.season.wins / bestLegend.season.games) * 100).toFixed(1)}
                    />
                </div>
            </div>
        </section>
    );
};

const RankedStats = ({
    tier = 'Tin 0',
    rating = 750,
    peak = 750,
    games = 0,
    wins = 0,
    losses = 0,
    winrate = '0',
    region = 'N/A',
}) => {
    return (
        <div className="ranked-stats">
            <p>
                <span className="stat-desc">Tier </span>
                <span className="stat stat-large">{tier}</span>
            </p>
            <p>
                <span className="stat-desc">Elo </span>
                <span className="stat stat-medium">{rating}</span>
            </p>
            <p>
                <span className="stat-desc">Peak </span>
                <span className="stat">{peak}</span>
            </p>
            <hr />
            <p>
                <span className="stat">{games}</span>
                <span className="stat-desc"> Games </span>
                <span className="stat">
                    ({wins}W-{losses}L)
                </span>
            </p>
            <p>
                <span className="stat-desc">Winrate </span>
                <span className="stat">{winrate}%</span>
            </p>
            <hr />
            <img
                src={`/assets/images/icons/flags/${region.toUpperCase()}.png`}
                alt={`${region}_flag`}
                className="region-icon"
            />
        </div>
    );
};

const BestLegendRankedStats = ({
    legend = 'Random',
    rating = 750,
    peak = 750,
    games = 0,
    wins = 0,
    losses = 0,
    winrate = '0',
}) => {
    return (
        <div className="ranked-stats">
            <p>
                <span className="stat stat-large">{legend}</span>
                <span className="stat-desc"> Best Legend</span>
            </p>
            <p>
                <span className="stat stat-medium">{rating}</span>
                <span className="stat-desc"> Elo</span>
            </p>
            <p>
                <span className="stat">{peak}</span>
                <span className="stat-desc"> Peak</span>
            </p>
            <hr />
            <p>
                <span className="stat">{games}</span>
                <span className="stat-desc"> Games </span>
                <span className="stat">
                    ({wins}W-{losses}L)
                </span>
            </p>
            <p>
                <span className="stat">{winrate}%</span>
                <span className="stat-desc"> Winrate</span>
            </p>
            <hr />
            <img src={`/assets/images/icons/legends/${legend}.png`} alt={`${legend}`} className="legend-icon" />
        </div>
    );
};
