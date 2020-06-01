import React from 'react';

import './styles.scss';
import { IPlayerSeasonFormat, ILegendStatsFormat } from 'corehalla.js';

import { RankedStats } from './RankedStats';
import { BestLegendRankedStats } from './BestLegendRankedStats';

interface Props {
    season: IPlayerSeasonFormat;
    bestLegend: ILegendStatsFormat;
}

export const SectionOverview: React.FC<Props> = ({ season, bestLegend }: Props) => {
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
