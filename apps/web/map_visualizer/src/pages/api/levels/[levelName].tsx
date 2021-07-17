import { NextApiRequest, NextApiResponse } from 'next'
import getConfig from 'next/config'
import { readFileSync } from 'fs'
import path from 'path'
import { decodeMap } from '../../../util/decodeMap'
// import { parseMapXML } from '../../../util/parseMapXML';

type Data =
    | {
          meta: string
          core: string
      }
    | {
          error: string
      }

export default async function (req: NextApiRequest, res: NextApiResponse<Data>): Promise<void> {
    const { levelName } = req.query
    try {
        const coreRaw = readFileSync(
            path.join(getConfig().serverRuntimeConfig.PROJECT_ROOT, `/public/mapData/${levelName}.meta.dat`),
        )
        const core = decodeMap(coreRaw.toString())
        console.log(core)
        // console.log(await fetch(``));
        // // const [, core]: [string, string] = await Promise.all([
        // //     await (await fetch(`/mapData/${levelName}.meta.dat`)).json(),
        // //     await (await fetch(`/mapData/${levelName}.core.dat`)).json(),
        // // ]);
        res.status(200).send({ meta: 'todo', core: 'xd' })
    } catch (e) {
        console.error(e)
        res.status(500).send({ error: 'Failed to fetch map data' })
    }
}
