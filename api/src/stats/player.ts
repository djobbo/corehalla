import * as express from 'express';
import { bhAPI } from '../bhAPI';

const router = express.Router();

const apiCacheControl = `public, max-age=120, s-maxage=180`;

router.get('/:id', (req, res, next) => {
	const id = parseInt(req.params.id);
	res.set('Cache-Control', apiCacheControl);
	bhAPI
		.fetchPlayerFormat(id)
		.then(res.status(200).send)
		.catch(res.status(500).send);
});

export { router };
