const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const mySQL = require('mysql');
const myConnection = require('express-myconnection');
const session = require('express-session');
const express = require('express');

// Configure subterra
const config = (application, views) => {
  // Set body-parser
  application.use(bodyParser.urlencoded({ extended: false }));

  // Set subterra assets
  application.use('/subterra/assets', express.static(__dirname + '/assets'));

  // Set database connection
  application.use(myConnection(mySQL, {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
  }, 'single'));

  // Set application session
  application.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: false
  }));

  // Set subterra routing
  application.use('/subterra', require('./routes/main'));

  // Set subterra views to application views
  return views.push(__dirname + '/views');
};

module.exports.config = config;
