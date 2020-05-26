import * as functions from 'firebase-functions';
import * as express from 'express';

import { createApiConnection, RankedRegion } from 'corehalla.js';

const apiKey = functions.config().bh_api.key;

const bhAPI = createApiConnection(apiKey);

const app = express();

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.get('/rankings/:bracket?/:region?/:page?', (req, res) => {
	const bracket = req.params.bracket || '1v1';
	const region = (req.params.region || 'ALL') as RankedRegion;
	const page = req.params.page || 1;

	const name = (req.query.player as string) || (req.query.p as string) || '';
	console.log(bracket, region, page, name);

	if (bracket === '2v2') {
		bhAPI
			.fetch2v2RankingsFormat({ region, page, name })
			.then((data) => res.status(200).json(data))
			.catch((e) => res.status(500).json('Internal Server Error'));
	} else if (bracket === '1v1') {
		bhAPI
			.fetch1v1RankingsFormat({ region, page, name })
			.then((data) => res.status(200).json(data))
			.catch((e) => res.status(500).json('Internal Server Error'));
	}
});

exports.api = functions.https.onRequest(app);
