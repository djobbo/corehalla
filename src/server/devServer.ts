require('dotenv').config();
import * as express from 'express';

// import { router as apiRouter } from './api';
import { app } from './app';

const PORT = process.env.PORT || 5000;
// const app = express();

// app.use('/api', apiRouter);

app.listen(PORT, () => {
    console.log(`App listening on http://localhost:${PORT}.`);
});
