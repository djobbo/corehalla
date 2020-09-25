import { IClanFormat, IPlayerStatsFormat } from 'corehalla.js';
import * as express from 'express';

import { router as rankingsRouter } from './rankings';
import { router as statsRouter } from './stats';

const router = express.Router();

router.use('/rankings', rankingsRouter);
router.use('/stats', statsRouter);
router.get('/', (req, res, next) => {
    req.context = { errors: [], data: 'Corehalla API' };
    next();
});

export { router };
