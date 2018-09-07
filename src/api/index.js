import { version } from '../../package.json';
import { Router } from 'express';
import templates from './templates';
import reports from './reports';

export default ({ config, db, log }) => {
	let api = Router();

	// mount the templates resource
	api.use('/reports', reports({ config, db, log }));

	// mount the templates resource
	api.use('/templates', templates({ config, db, log }));

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	return api;
}
