const debug = require('debug')('TouchCMD');
const dotenv = require('dotenv').config();
const compression = require('compression');

const subterra = require('./subterra');

const express = require('express');
const app = express();

// Activate server-side gzip compression
app.use(compression());

// Define view paths
let viewArray = [
  __dirname + '/views'
];

// Configure subterra
subterra.config(app, viewArray);

// Define static-file folders
app
  .use('/assets', express.static(__dirname + '/assets'))
  .use('/media', express.static(__dirname + '/media'));

// Set view engine to EJS
app
  .set('view engine', 'ejs')
  .set('views', viewArray);

// Define app routing
app.use('/subterra', require('./subterra/routes/main'));
app.use('/', require('./routes/main'));

// Run the application
app.listen(process.env.PORT || 3000, () => {
	debug(`Server started`);
});
