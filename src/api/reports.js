import resource from 'resource-router-middleware';
require('isomorphic-fetch');
const qrcode = require('yaqrcode');
const createReport = require('docx-templates').default;
const fs = require('fs');
const carbone = require('carbone');
const imageType = require('image-type');
import config from '../config.json';

export default ({ config, db, log }) => resource({

	/** Property name to store preloaded entity on `request`. */
	id : 'report',

	/** For requests with an `id`, you can auto-load the entity.
	 *  Errors terminate the request, success sets `req[id] = data`.
	 */
	load(req, id, callback) {
		let report = reports.find( report => report===id ),
			err = report ? null : '';
		callback(err, report);
	},

	/** GET / - List all entities */
	index({ params }, res) {
		/*const data = {
		    name:"Tesla Inc.",
				address: "304 Cresent Road",
				city: "Hamilton",
				province: "Ontario",
				postal: "L5B2L3",
				phone: "(400) 249 3403",
				invoice: "13",
				invoiceDate: "12/21/2017"
		};
    */
		res.json("");
		log.info(`GET /api/reports 200`)
	},

	/** POST / - Create a new entity */
	create({ body }, res) {
		log.info("body", body)
    console.log("body", body);
		const outputName = body.outputFileName ? "./src/reports/"+ body.outputFileName +".docx" : "./src/reports/"+ body.template+"_output"+Date.now()+".docx";
		const outputPath = body.outputFileName ? body.outputFileName +".docx" : body.template+"_output"+Date.now()+".docx";
		createReport({
	      template: "./src/templates/"+body.template,
	      output: outputName,
	      data: query => body.placeHolders,
	      additionalJsContext: {
	        tile: async (z, x, y, size = 3) => {
	          const resp = await fetch(
	            `http://tile.stamen.com/toner/${z}/${x}/${y}.png`
	          );
	          const buffer = resp.arrayBuffer
	            ? await resp.arrayBuffer()
	            : await resp.buffer();
	          return { width: size, height: size, data: buffer, extension: '.png' };
	        },
	        qr: contents => {
	          const dataUrl = qrcode(contents, { size: 500 });
	          const data = dataUrl.slice('data:image/gif;base64,'.length);
	          return { width: 6, height: 6, data, extension: '.gif' };
	        },
					imageURL: async contentURL => {

						const resp = await fetch(
	            contentURL
	          );
	          const buffer = resp.arrayBuffer
	            ? await resp.arrayBuffer()
	            : await resp.buffer();

						const type = imageType(buffer);

						return { width: 6, height: 6, data: buffer, extension: type.ext };


					}
	      },
	    }).then(success => {
				if(body.outputPDFBool) {
					const filename = body.outputFileName ? body.outputFileName : body.template+"_output"+Date.now()
					var data = {
				   };

					var options = {
					 convertTo : 'pdf' //can be docx, txt, ...
					};

				 carbone.render(outputName, data, options, function(err, result){
					 if (err) {
						 res.json("Error generating report: " + err.message);
					 }
					 fs.writeFileSync("./src/reports/"+filename+".pdf", result);
					 res.json(config.host+"/report/"+filename+".pdf");
					 log.info("POST /api/reports 200 SUCCESS ON CREATE PDF REPORT");
					 //process.exit(); // to kill automatically LibreOffice workers
				  });
		 		} else {
					res.json(config.host+"/report/"+outputPath);
					log.info("POST /api/reports 200 SUCCESS ON CREATE WORD REPORT");
		 		}

			}).catch(error => {
				log.warn(`POST /api/reports Error generating report: ${error.message}`)
				console.log(error.message);
				res.json("Error generating report: " + error.message);
			});


	},

	/** GET /:id - Return a given entity */
	read({ report }, res) {
		res.json(report);
		log.info(`GET /api/reports 200`)
	},

	/** PUT /:id - Update a given entity */
	update({ report, body }, res) {
		for (let key in body) {
			if (key!=='id') {
				report[key] = body[key];
			}
		}
		res.sendStatus(204);
	},

	/** DELETE /:id - Delete a given entity */
	delete({ report }, res) {
		reports.splice(reports.indexOf(report), 1);
		res.sendStatus(204);
	}
});
