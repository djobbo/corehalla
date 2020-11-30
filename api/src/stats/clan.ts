import * as express from 'express';
import { bhAPI } from '../bhAPI';

const router = express.Router();

const apiCacheControl = `public, max-age=180, s-maxage=240`;

router.get('/:id', (req, res, next) => {
	const id = parseInt(req.params.id);
	res.set('Cache-Control', apiCacheControl);
	bhAPI
		.fetchClanFormat(id)
		.then((data) => {
			req.context = { errors: [], data };
			next();
		})
		.catch((e) => {
			console.error(e);
			req.context = {
				errors: ['Failed to fetch 1v1 Rankings!'],
				data: null,
			};
			next();
		});
});

export { router };
