import * as functions from 'firebase-functions';

import { createApiConnection, RankedRegion } from 'corehalla.js';
import * as express from 'express';
import * as cors from 'cors';

const apiKey = functions.config().bh_api.key;

const bhAPI = createApiConnection(apiKey);

const app = express();

app.use(cors({ origin: true }));

const cacheTime = {
    client: '120',
    server: '180',
};

const apiCacheControl = `public, max-age=${cacheTime.client}, s-maxage=${cacheTime.server}`;

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json('Corehalla API');
});

router.get('/rankings/:bracket?/:region?/:page?', (req, res) => {
    const bracket = req.params.bracket || '1v1';
    const region = (req.params.region || 'ALL') as RankedRegion;
    const page = req.params.page || 1;

    const name = (req.query.player as string) || (req.query.p as string) || '';

    res.set('Cache-Control', apiCacheControl);

    if (bracket === '2v2') {
        bhAPI
            .fetch2v2RankingsFormat({ region, page, name })
            .then((data) => {
                res.status(200).json(data);
            })
            .catch((e) => {
                console.error(e);
                res.status(500).json('Failed to fetch 1v1 Rankings!');
            });
    } else if (bracket === '1v1') {
        bhAPI
            .fetch1v1RankingsFormat({ region, page, name })
            .then((data) => {
                res.status(200).json(data);
            })
            .catch((e) => {
                console.error(e);
                res.status(500).json('Failed to fetch 2v2 Rankings!');
            });
    } else {
        res.status(400).json('Bad Request');
    }
});

router.get('/stats/player/:id', (req, res) => {
    const id = parseInt(req.params.id);
    res.set('Cache-Control', apiCacheControl);
    bhAPI
        .fetchPlayerFormat(id)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch((e) => {
            console.error(e);
            res.status(500).json('Internal server error');
        });
});

router.get('/stats/clan/:id', (req, res) => {
    const id = parseInt(req.params.id);
    res.set('Cache-Control', apiCacheControl);
    bhAPI
        .fetchClanFormat(id)
        .then((data) => res.status(200).json(data))
        .catch((e) => {
            console.error(e);
            res.status(500).json('Internal server error');
        });
});

router.get('/**', (req, res) => {
    res.status(404).json('Not Found!');
});

app.use('/api', router);

exports.api = functions.https.onRequest(app);
