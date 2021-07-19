import { fetchPlayerFormat } from '@corehalla/core'
import { MockPlayerStats } from '@corehalla/core/mocks'
import { createPlayerCanvas } from '@corehalla/open-graph'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    res.setHeader('Cache-Control', 's-maxage=150, stale-while-revalidate')

    const { id } = req.query
    try {
        const player =
            process.env.NODE_ENV === 'production'
                ? await fetchPlayerFormat(process.env.BH_API_KEY, id as string)
                : MockPlayerStats

        const canvas = await createPlayerCanvas({
            name: player.name,
            level: player.level.toString(),
            xp: player.xp.toString(),
            matchtime: player.matchtime.toString(),
            region: player.season.region || 'US-E',
            mostPlayed: {
                legend: player.legends.sort((a, b) => b.xp - a.xp)[0].name,
            },
        })

        const stream = canvas.createJPEGStream()

        res.setHeader('Content-Type', 'image/jpg')
        res.send(stream)
    } catch (e) {
        res.send({ error: e })
    }
}
