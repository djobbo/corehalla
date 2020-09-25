import 'firebase-admin';

import * as functions from 'firebase-functions';
import * as express from 'express';
import * as cors from 'cors';

import { renderApp } from './renderApp';
import { router as apiRouter } from './api';

const app = express();

app.use(cors({ origin: true }));

app.use('/api', apiRouter);
app.get('**', renderApp);

exports.app = functions.https.onRequest(app);
