import 'firebase-admin';

import * as functions from 'firebase-functions';
import * as express from 'express';
import * as cors from 'cors';

import { router as rankingsRouter } from './routes/rankings';
import { router as statsRouter } from './routes/stats';

const app = express();

app.use(cors({ origin: true }));

app.use('/api/rankings', rankingsRouter);
app.use('/api/stats', statsRouter);
app.get('/api', (req, res) => {
    res.send('Corehalla API');
});

exports.api = functions.https.onRequest(app);
