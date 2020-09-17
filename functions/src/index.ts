import * as functions from 'firebase-functions';
import * as express from 'express';
import * as cors from 'cors';

import { router as rankingsRouter } from './routes/rankings';
import { router as statsRouter } from './routes/stats';

const app = express();

app.use(cors({ origin: true }));

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json('Corehalla API');
});

router.get('/rankings', rankingsRouter);
router.get('/stats', statsRouter);

router.get('/**', (req, res) => {
    res.status(404).json('Not Found!');
});

app.use('/api', router);

exports.api = functions.https.onRequest(app);
