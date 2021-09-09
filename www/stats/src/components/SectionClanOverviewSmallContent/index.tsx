import Link from 'next/link'

import { StatDesc, StatMedium, StatSmall } from '@TextStyles'

interface Props {
    name: string
    level: number | string
    xp: number
    personalXp: number
    xpPercentage: number
    id: string | number // TODO: ch.js
}

export function SectionClanOverviewSmallContent({ name, level, xp, personalXp, xpPercentage, id }: Props): JSX.Element {
    return (
        <div>
            <Link href={`/stats/clan/${id}`}>
                <StatMedium>{name}</StatMedium>
            </Link>
            <div>
                <StatDesc>level</StatDesc>
                <StatSmall>{level}</StatSmall>
                <StatDesc>({xp} xp)</StatDesc>
            </div>
            <div>
                <StatDesc>personal xp</StatDesc>
                <StatSmall>{personalXp}</StatSmall>
                <StatDesc>({xpPercentage.toFixed(2)}%)</StatDesc>
            </div>
        </div>
    )
}
