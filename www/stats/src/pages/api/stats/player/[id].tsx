import { fetchPlayerFormat } from '@corehalla/core'
import { MockPlayerStats } from '@corehalla/core/mocks'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const id = req.query.id as string

    if (process.env.NODE_ENV === 'production') {
        if (!id) {
            res.status(400).json({ error: 'Bad Request' })
            return
        }

        const rankings = await fetchPlayerFormat(process.env.BH_API_KEY, id)

        res.status(200).json(rankings)
        return
    }

    res.status(200).json(MockPlayerStats)
}
