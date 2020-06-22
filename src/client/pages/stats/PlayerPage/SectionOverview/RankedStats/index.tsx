import React, { FC } from 'react';

import { RankedRegion } from 'corehalla.js';

interface Props {
    tier: string;
    rating: number;
    peak: number;
    games: number;
    wins: number;
    losses: number;
    winrate: string;
    region: RankedRegion | 'N/A';
}

export const RankedStats: FC<Props> = ({
    tier = 'Tin 0',
    rating = 750,
    peak = 750,
    games = 0,
    wins = 0,
    losses = 0,
    winrate = '0',
    region = 'N/A',
}: Props) => {
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
