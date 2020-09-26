import * as express from 'express';
import { bhAPI } from '../../bhAPI';
import { RankedRegion } from 'corehalla.js';

const router = express.Router();

const apiCacheControl = `public, max-age=180, s-maxage=240`;

router.get('/1v1/:region?/:page?', (req, res, next) => {
    const region = (req.params.region || 'ALL') as RankedRegion;
    const page = req.params.page || 1;

    const name = (req.query.player as string) || (req.query.p as string) || '';

    res.set('Cache-Control', apiCacheControl);

    bhAPI
        .fetch1v1RankingsFormat({ region, page, name })
        .then((data) => {
            req.context = { errors: [], data };
            next();
        })
        .catch((e) => {
            console.error(e);
            req.context = { errors: ['Failed to fetch 1v1 Rankings!'], data: null };
            next();
        });
});

router.get('/2v2/:region?/:page?', (req, res, next) => {
    const region = (req.params.region || 'ALL') as RankedRegion;
    const page = req.params.page || 1;

    const name = (req.query.player as string) || (req.query.p as string) || '';

    res.set('Cache-Control', apiCacheControl);

    bhAPI
        .fetch2v2RankingsFormat({ region, page, name })
        .then((data) => {
            req.context = { errors: [], data };
            next();
        })
        .catch((e) => {
            console.error(e);
            req.context = { errors: ['Failed to fetch 2v2 Rankings!'], data: null };
            next();
        });
});

export { router };
