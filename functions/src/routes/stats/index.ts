import * as express from 'express';

import { router as playerStatsRouter } from './player';
import { router as clanStatsRouter } from './clan';

const router = express.Router();

router.get('/player', playerStatsRouter);
router.get('/clan', clanStatsRouter);

export { router };
