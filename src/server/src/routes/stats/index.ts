import * as express from 'express';

import { router as playerStatsRouter } from './player';
import { router as clanStatsRouter } from './clan';

const router = express.Router();

router.use('/player', playerStatsRouter);
router.use('/clan', clanStatsRouter);

router.get('/', (req, res) => {
    res.send('Stats');
});
export { router };
