import * as express from 'express';
import { bhAPI } from '../bhAPI';

const router = express.Router();

router.get('/:id', (req, res) => {
	const id = parseInt(req.params.id);

	bhAPI
		.fetchClanFormat(id)
		.then(res.status(200).send)
		.catch(res.status(500).send);
});

export { router };
