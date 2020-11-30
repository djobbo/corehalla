import * as express from 'express';

import { router as rankingsRouter } from './rankings';
import { router as statsRouter } from './stats';

const app = express();

app.use('/rankings', rankingsRouter);
app.use('/stats', statsRouter);
app.get('/', (req, res) => {
	'Corehalla API';
});

app.listen(8080, () => {
	console.log(`API Listening on port 8080`);
});
