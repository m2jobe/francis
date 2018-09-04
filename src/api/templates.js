import resource from 'resource-router-middleware';
import templates from '../models/templates';
var fs = require('fs');
var path = require('path');

var multer  = require('multer')
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './src/templates')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({ storage: storage }).single('avatar')

export default ({ config, db }) => resource({

	/** Property name to store preloaded entity on `request`. */
	id : 'template',

	/** For requests with an `id`, you can auto-load the entity.
	 *  Errors terminate the request, success sets `req[id] = data`.
	 */
	load(req, id, callback) {
		var files = fs.readdirSync('./src/templates');
		const templates = files;
		console.log("templates", templates);

		let template = templates.find( template => template===id ),
			err = template ? null : 'The template you provided does not exist, please make sure you uploaded it';
		callback(err, template);
	},

	/** GET / - List all entities */
	index({ params }, res) {

		var files = fs.readdirSync('./src/templates');
		const templates = files;

		res.json(templates);
	},

	/** POST / - Create a new entity */
	create(req, res) {
		//body.id = templates.length.toString(36);
		//templates.push(body);
		upload(req, res, function (err) {
	    if (err) {
	      // An error occurred when uploading
				console.log("err", err)
				res.json(err);
	      return
	    }

	    // Everything went fine
	  })

		res.json("Template Posted");
	},

	/** GET /:id - Return a given entity */
	read({ template }, res) {
		res.json(template);
	},

	/** PUT /:id - Update a given entity */
	update({ template, body }, res) {
		for (let key in body) {
			if (key!=='id') {
				template[key] = body[key];
			}
		}
		res.sendStatus(204);
	},

	/** DELETE /:id - Delete a given entity */
	delete({ template }, res) {
		templates.splice(templates.indexOf(template), 1);
		res.sendStatus(204);
	}
});
