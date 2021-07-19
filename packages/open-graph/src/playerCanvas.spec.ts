import { createWriteStream, existsSync } from 'fs'
import { mkdir } from 'fs/promises'
import { join } from 'path'

import { createPlayerCanvas } from './playerCanvas'

describe('Player Canvas', () => {
    it('creates player stats canvas', async () => {
        const canvas = await createPlayerCanvas({
            name: 'Una',
            level: '87',
            xp: '785645',
            matchtime: '2361h 34m 40s',
            region: 'EU',
            mostPlayed: { legend: 'Ada', weapon: 'Spear' },
        })

        const outDir = './__tests__/'

        if (!existsSync(outDir)) await mkdir(outDir, { recursive: true })

        const out = createWriteStream(join(outDir, 'player_stats.jpg'))
        const stream = canvas.createJPEGStream()
        stream.pipe(out)
    })
})
