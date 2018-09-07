import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import initializeDb from './db';
import middleware from './middleware';
import api from './api';
import config from './config.json';
require('dotenv').config()

var path = require('path');

let app = express();
app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders
}));

app.use(bodyParser.json({
	limit : config.bodyLimit
}));

// connect to db
initializeDb( db => {

	// internal middleware
	app.use(middleware({ config, db }));

	app.use('*', (req, res, next) => {
		const apiKey = process.env.API_KEY;
		if(req["headers"]["template-api-key"] == apiKey) {
			next();
		} else {
			res.sendStatus(401);
		}
	});

	// api router
	app.use('/api', api({ config, db }));

	app.get('/', function(req, res) {
	    res.sendFile(path.join(__dirname + '/public/index.html'));
	});

	app.get('/createReport', function(req, res) {
	    res.sendFile(path.join(__dirname + '/public/createReport.html'));
	});

	app.get('/report/:reportId', function(req, res) {
			const reportId = req.params.reportId;
			res.sendFile(path.join(__dirname + '/reports/'+reportId));
	});

	app.get('/template/:templateId', function(req, res) {
			const templateId = req.params.templateId;
			res.sendFile(path.join(__dirname + '/templates/'+templateId));
	});

        app.get('/logs', function(req, res) {
            res.sendFile(path.join(__dirname + '/public/logs.out'));
        });

	app.server.listen(process.env.PORT || config.port, () => {
		console.log(`Started on port ${app.server.address().port}`);
	});
});

export default app;
