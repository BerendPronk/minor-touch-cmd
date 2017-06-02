// Defines used packages
const compression = require('compression');
const debug = require('debug')('TouchCMD');
const path = require('path');
const bodyParser = require('body-parser');
const mySQL = require('mysql');
const myConnection = require('express-myconnection');
const session = require('express-session');
const express = require('express');
const app = express();

// Declare which server functionalities the app must use
app
  .use(compression())
  .use('/assets', express.static(path.join(__dirname, 'assets')))
  .use(bodyParser.urlencoded({ extended: false }));

// Set EJS view engine
app
  .set('view engine', 'ejs')
  .set('views', path.join(__dirname, 'views'));

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
app.use('/subterra', require('./routes/subterra'));

app
  .get('/', (req, res) => {
    req.getConnection((err, connection) => {
      connection.query(`
        SELECT * FROM pages
      `, [], (err, results) => {
        let menu = [];

        results.forEach(page => {
          if (page.type === 'year') {
            menu.push(page.title);
          }
        });

        res.render('index', {
          menu: menu
        });
      });
    });
  });

// Run the application
app.listen(3000, () => {
	debug(`Server started`);
});
