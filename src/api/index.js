import { version } from '../../package.json';
import { Router } from 'express';
import templates from './templates';
import reports from './reports';

export default ({ config, db }) => {
	let api = Router();

	// mount the templates resource
	api.use('/reports', reports({ config, db }));

	// mount the templates resource
	api.use('/templates', templates({ config, db }));

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	return api;
}
