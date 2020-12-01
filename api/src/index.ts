import * as express from 'express';

import { router as rankingsRouter } from './rankings';
import { router as statsRouter } from './stats';

const app = express();

const PORT = 8080;
const HOST = '0.0.0.0';

app.use('/rankings', rankingsRouter);
app.use('/stats', statsRouter);
app.get('/', (req, res) => {
	res.status(200).send('Corehalla API');
});

app.listen(PORT, HOST, () => {
	console.log(`API Listening on port 8080`);
});
