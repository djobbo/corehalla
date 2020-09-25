import * as express from 'express';

import { router as rankingsRouter } from './rankings';
import { router as statsRouter } from './stats';

const router = express.Router();

router.use('/rankings', rankingsRouter);
router.use('/stats', statsRouter);
router.get('/', (req, res) => {
    res.send('Corehalla app');
});

export { router };
