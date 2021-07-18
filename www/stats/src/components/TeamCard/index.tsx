import type { I2v2TeamFormat } from '@corehalla/core/types'
// Library imports
import Link from 'next/link'

import { Card } from '../Card'
import { BarChart } from '../Charts'
// Components imports
import { StatDesc, StatSmall } from '../TextStyles'
import styles from './index.module.scss'

interface Props {
    team: I2v2TeamFormat
}

export function TeamCard({ team }: Props): JSX.Element {
    return (
        <Card>
            <Link href={`/stats/player/${team.teammate.id}`}>
                <a className={styles.teammateName}>
                    <img
                        className={styles.regionIcon}
                        src={`/images/icons/flags/${team.region}.png`}
                        alt={team.region}
                    />
                    {team.teammate.name}
                </a>
            </Link>
            <div className={styles.stats}>
                <img
                    className={styles.rankedIcon}
                    src={`/images/icons/ranked/${team.season.tier}.png`}
                    alt={team.region}
                />
                <div>
                    <div>
                        <StatSmall>{team.season.rating}</StatSmall>
                        <StatDesc>rating</StatDesc>
                    </div>
                    <div>
                        <StatSmall>{team.season.peak}</StatSmall>
                        <StatDesc>peak</StatDesc>
                    </div>
                    <div>
                        <StatSmall>{((team.season.wins / team.season.games) * 100).toFixed(2)}%</StatSmall>
                        <StatDesc>winrate</StatDesc>
                    </div>
                    <div>
                        <StatSmall>{team.season.ratingSquash}</StatSmall>
                        <StatDesc>elo squash</StatDesc>
                    </div>
                </div>
            </div>
            <BarChart width="100%" height="1rem" amount={(team.season.wins / team.season.games) * 100} />
            <div className={styles.winLoss}>
                <StatSmall>{team.season.games}</StatSmall>
                <StatDesc>games</StatDesc>
                <StatSmall>
                    {team.season.wins}W-{team.season.games - team.season.wins}L
                </StatSmall>
            </div>
        </Card>
    )
}
