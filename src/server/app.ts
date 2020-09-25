import * as express from 'express';
import * as cors from 'cors';

import { renderApp } from './renderApp';
import { router as apiRouter } from './api';

declare module 'express-serve-static-core' {
    interface Request {
        context?: { errors: string[]; data: any };
    }
}

const app = express();

app.use(cors({ origin: true }));

app.use('/api', apiRouter, (req, res) => {
    if (!req.context || req.context.errors.length > 0) res.status(500).send('Internal Server Error');
    else res.status(200).send(req.context.data);
});
app.get('**', apiRouter, renderApp);

export { app };
