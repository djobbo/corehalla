import type { I2v2TeamFormat } from '@corehalla/core/types'
import Link from 'next/link'

import styles from './TeamCard.module.scss'

import { Card } from '../Card'
import { BarChart } from '../Charts'
import { StatDesc, StatLarge, StatSmall } from '../TextStyles'

interface Props {
    team: I2v2TeamFormat
}

export const TeamCard = ({ team }: Props): JSX.Element => {
    return (
        <Card className={styles.wrapper}>
            <img
                className={styles.rankedIcon}
                src={`/images/ranked-banners/${team.season.tier}.png`}
                alt={team.region}
            />
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
            <div>
                <div>
                    <StatLarge>{team.season.rating}</StatLarge>
                    <StatDesc>elo (</StatDesc>
                    <StatSmall>{team.season.peak}</StatSmall>
                    <StatDesc>peak)</StatDesc>
                </div>
                <div>
                    <StatSmall>{team.season.games}</StatSmall>
                    <StatDesc>games</StatDesc>
                    <StatSmall>
                        {team.season.wins}W-{team.season.games - team.season.wins}L
                    </StatSmall>
                </div>
                <div>
                    <StatSmall>{team.season.ratingSquash}</StatSmall>
                    <StatDesc>elo squash</StatDesc>
                </div>
            </div>
            <div className={styles.winrateContainer}>
                <BarChart width="100%" height="0.5rem" amount={(team.season.wins / team.season.games) * 100} rounded />
                <StatSmall>{((team.season.wins / team.season.games) * 100).toFixed(2)}%</StatSmall>
            </div>
        </Card>
    )
}
