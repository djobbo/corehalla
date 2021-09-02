import type { IRanking1v1Format } from '@corehalla/core/types'

import { RankingsTable } from '@RankingsTable'

export interface Props {
    rankings: IRanking1v1Format[]
}

export const Rankings1v1Tab = ({ rankings }: Props): JSX.Element => {
    return <RankingsTable rankings={rankings} />
}
