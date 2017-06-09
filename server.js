// Defines used packages
const compression = require('compression');
const debug = require('debug')('TouchCMD');

const bodyParser = require('body-parser');
const fs = require('fs');

const mySQL = require('mysql');
const myConnection = require('express-myconnection');

const session = require('express-session');
const express = require('express');
const app = express();

// Declare which server functionalities the app must use
app
  .use(compression())
  .use('/assets', express.static(__dirname + '/assets'))
  .use('/media', express.static(__dirname + '/media'))
  .use('/subterra/assets', express.static(__dirname + '/subterra/assets'))
  .use(bodyParser.urlencoded({ extended: false }));

// Set EJS view engine
app
  .set('view engine', 'ejs')
  .set('views', [__dirname + '/views', __dirname + '/subterra/views']);

// Create connection to MySQL database
app.use(myConnection(mySQL, {
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'touch-cmd',
  port: 3306
}, 'single'));

// Declare session to let admins stay logged in
app.use(session({
  secret: 'qwsawedserfdrtgftyhgyujhuikjiolk',
  saveUninitialized: true,
  resave: false
}));

// Declare app routing
app.use('/', require('./routes/main'));
app.use('/subterra', require('./subterra/routes/main'));

// Run the application
app.listen(3000, () => {
	debug(`Server started`);
});
