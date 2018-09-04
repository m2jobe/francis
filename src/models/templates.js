// our example model is just an Array

var fs = require('fs');
var files = fs.readdirSync('./src/templates');
const templates = files;
export default templates;
