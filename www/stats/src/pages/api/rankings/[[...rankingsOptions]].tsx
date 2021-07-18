import { fetch1v1RankingsFormat } from '@corehalla/core'
import { Mock1v1Rankings } from '@corehalla/core/mocks'
import { RankedRegion } from '@corehalla/core/types'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const [bracket, region, page] =
        (req.query?.rankingsOptions as [bracket: '1v1' | '2v2', region: RankedRegion, page: string]) || []
    const playerSearch = req.query?.p as string

    if (process.env.NODE_ENV === 'production') {
        if (!bracket || !region || !page) {
            // TODO: verify types (bracket = 1v1 | 2v2 etc)
            res.status(400).json({ error: 'Bad Request' })
            return
        }

        const rankings = await fetch1v1RankingsFormat(process.env.BH_API_KEY, {
            name: playerSearch ?? '',
            region,
            page,
        })

        res.status(200).json(rankings)
        return
    }

    res.status(200).json(Mock1v1Rankings)
}
