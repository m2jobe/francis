import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import initializeDb from './db';
import middleware from './middleware';
import api from './api';
import config from './config.json';
const fs = require('fs');
var serveIndex = require('serve-index');
var path = require('path');
require('dotenv').config()
// create a rolling file logger based on date/time that fires process events
const opts = {
	errorEventName:'error',
        logDirectory:'/Users/muhammed/documents/me/francis/src/public/logs', // NOTE: folder must exist and be writable...
        fileNamePattern:'roll-<DATE>.log',
        dateFormat:'YYYY.MM.DD'
};
const log = require('simple-node-logger').createRollingFileLogger( opts );
var logsPath = path.join(__dirname, 'public/logs');

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
	app.use(middleware({ config, db, log }));

	app.use('*', (req, res, next) => {
		const apiKey = process.env.API_KEY;
		if(req["headers"]["template-api-key"] == apiKey) {
			next();
		} else {
			res.sendStatus(401);
		}
	});

	// api router
	app.use('/api', api({ config, db, log }));

	app.get('/', function(req, res) {
			log.info("GET / 200")
	    res.sendFile(path.join(__dirname + '/public/index.html'));
	});

	app.get('/createReport', function(req, res) {
			log.info("GET /createReport 200")
	    res.sendFile(path.join(__dirname + '/public/createReport.html'));
	});

	app.get('/report/:reportId', function(req, res) {
			log.info(`GET /report/${reportId} 200`)
			const reportId = req.params.reportId;
			res.sendFile(path.join(__dirname + '/reports/'+reportId));
	});

	app.get('/template/:templateId', function(req, res) {
			log.info(`GET /template/${templateId} 200`)
			const templateId = req.params.templateId;
			res.sendFile(path.join(__dirname + '/templates/'+templateId));
	});

	app.get('/logs/:logID', function(req, res) {
			log.info(`GET /logs/${logID} 200`)
			const logID = req.params.logID;
			res.sendFile(path.join(__dirname + '/public/logs/'+logID));
	});


	app.server.listen(process.env.PORT || config.port, () => {
		log.info(`Started on port ${app.server.address().port}`)
		console.log(`Started on port ${app.server.address().port}`);
	});
});

export default app;
