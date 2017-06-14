const compression = require('compression');
const debug = require('debug')('TouchCMD');

const bodyParser = require('body-parser');

const mySQL = require('mysql');
const myConnection = require('express-myconnection');

const session = require('express-session');
const express = require('express');
const app = express();

// Define dotenv config
require('dotenv').config();

// Activate server-side gzip compression
app.use(compression());

// Enable body-parser to be used in data parsing
app.use(bodyParser.urlencoded({ extended: false }));

// Define static-file folders
app
  .use('/assets', express.static(__dirname + '/assets'))
  .use('/media', express.static(__dirname + '/media'))
  .use('/subterra/assets', express.static(__dirname + '/subterra/assets'))

// Set view engine to EJS
app
  .set('view engine', 'ejs')
  .set('views', [__dirname + '/views', __dirname + '/subterra/views']);

// Connect to MySQL database
app.use(myConnection(mySQL, {
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT
}, 'single'));

// Define session for subterra
app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  resave: false
}));

// Define app routing
app.use('/', require('./routes/main'));
app.use('/subterra', require('./subterra/routes/main'));

// Run the application
app.listen(3000, () => {
	debug(`Server started`);
});
