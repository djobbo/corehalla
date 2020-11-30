import * as express from 'express';
import { bhAPI } from '../bhAPI';

const router = express.Router();

const apiCacheControl = `public, max-age=180, s-maxage=240`;

router.get('/:id', (req, res) => {
	const id = parseInt(req.params.id);
	res.set('Cache-Control', apiCacheControl);
	bhAPI
		.fetchClanFormat(id)
		.then(res.status(200).send)
		.catch(res.status(500).send);
});

export { router };
