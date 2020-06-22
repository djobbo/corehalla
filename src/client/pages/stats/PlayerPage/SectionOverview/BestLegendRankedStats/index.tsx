import React, { FC } from 'react';

interface Props {
    legend: string;
    rating: number;
    peak: number;
    games: number;
    wins: number;
    losses: number;
    winrate: string;
}

export const BestLegendRankedStats: FC<Props> = ({
    legend = 'Random',
    rating = 750,
    peak = 750,
    games = 0,
    wins = 0,
    losses = 0,
    winrate = '0',
}: Props) => {
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
