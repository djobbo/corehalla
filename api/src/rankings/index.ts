import * as express from 'express';
import { bhAPI } from '../bhAPI';

import type { RankedRegion } from 'corehalla';

const router = express.Router();

router.get('/1v1/:region?/:page?', (req, res) => {
	const region = (req.params.region || 'ALL') as RankedRegion;
	const page = req.params.page || 1;

	const name = (req.query.player as string) || (req.query.p as string) || '';

	bhAPI
		.fetch1v1RankingsFormat({ region, page, name })
		.then(res.status(200).send)
		.catch(res.status(500).send);
});

router.get('/2v2/:region?/:page?', (req, res) => {
	const region = (req.params.region || 'ALL') as RankedRegion;
	const page = req.params.page || 1;

	const name = (req.query.player as string) || (req.query.p as string) || '';

	bhAPI
		.fetch2v2RankingsFormat({ region, page, name })
		.then(res.status(200).send)
		.catch(res.status(500).send);
});

export { router };
