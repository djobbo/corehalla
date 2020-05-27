import * as functions from 'firebase-functions';

import { createApiConnection } from 'corehalla.js';

import * as cors from 'cors';
cors({ origin: true });

const apiKey = functions.config().bh_api.key;

const bhAPI = createApiConnection(apiKey);

// app.get('/rankings/:bracket?/:region?/:page?', (req, res) => {
// 	const bracket = req.params.bracket || '1v1';
// 	const region = (req.params.region || 'ALL') as RankedRegion;
// 	const page = req.params.page || 1;

// 	const name = (req.query.player as string) || (req.query.p as string) || '';
// 	console.log(bracket, region, page, name);

// 	if (bracket === '2v2') {
// 		bhAPI
// 			.fetch2v2RankingsFormat({ region, page, name })
// 			.then((data) => res.status(200).json(data))
// 			.catch((e) => res.status(500).json('Internal Server Error'));
// 	} else if (bracket === '1v1') {
// 		bhAPI
// 			.fetch1v1RankingsFormat({ region, page, name })
// 			.then((data) => res.status(200).json(data))
// 			.catch((e) => res.status(500).json('Internal Server Error'));
// 	}
// });

exports.fetchPlayer = functions.https.onCall((data, context) => {
	const id = data.id;
	return bhAPI.fetchPlayerFormat(id);
});
