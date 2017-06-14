const debug = require('debug')('TouchCMD');
const database = require('../../subterra/assets/script/modules/database');
const express = require('express');
const router = express.Router();

// [GET] /subterra/portfolio
router.get('/', (req, res) => {
  debug(`[${ req.method }] /subterra/portfolio`);

  // Object containing system data, after MySQL queries
  let system = {
    portfolio: []
  };

  req.getConnection((err, connection) => {
    // Fetch all portfolio items from database
    connection.query(`
      SELECT * FROM portfolio
    `, [], (err, portfolio) => {
      // Push types in system object
      portfolio.forEach(item => {
        system.portfolio.push({
          id: item.id,
          title: item.title,
          courses: item.courses
        });
      });

      // Check if a session already exists
      if (req.session.username) {
        res.render('portfolio/index', {
          username: req.session.username,
          pathname: '/subterra/portfolio',
          feedback: req.query.feedback,
          feedbackState: req.query.state,
          system: {
            portfolio: system.portfolio
          }
        });
      } else {
        // Provide feedback that login session has ended
        res.redirect(`/subterra/login?feedback=Your login session ended. Log in again below.&state=negative`);
      }
    });
  });
});

// [GET] /subterra/portfolio/add
router.get('/add', (req, res) => {
  debug(`[${ req.method }] /subterra/portfolio/add`);

  req.getConnection((err, connection) => {
    // Fetch all 'course' pages from database
    database.retrieve(connection, {
      category: 'portfolio',
      tables: ['pages'],
      callback: systemData => {
        // Check if a session already exists
        if (req.session.username) {
          res.render('portfolio/add', {
            username: req.session.username,
            pathname: '/subterra/portfolio',
            feedback: req.query.feedback,
            feedbackState: req.query.state,
            system: systemData
          });
        } else {
          // Provide feedback that login session has ended
          res.redirect(`/subterra/login?feedback=Your login session ended. Log in again below.&state=negative`);
        }
      }
    });
  });
});

// [POST] /subterra/portfolio/add
router.post('/add', (req, res) => {
  debug(`[${ req.method }] /subterra/portfolio/add`);

  const data = {
    title: req.body.title.replace(/'/g, '"'),
    courses: req.body.courses,
    paragraph: req.body['content-p'],
    image: req.body['content-i-name'],
    video: req.body['content-e']
  };

  req.getConnection((err, connection) => {
    // Fetch all portfolio items from database
    connection.query(`
      SELECT * FROM portfolio
    `, [], (err, portfolio) => {
      let exists;

      // Check if portfolio item title already exists
      portfolio.forEach(item => {
        if (item.title === data.title) {
          exists = true;
        }
      });

      // Check if a session already exists
      if (!req.session.username) {
        // Provide feedback that login session has ended
        res.redirect(`/subterra/login?feedback=Your login session ended. Log in again below.&state=negative`);
      } else if (!exists) {
        // Add submitted data to database
        connection.query(`
          INSERT INTO portfolio SET ?
        `, [data], (err, results) => {
          // Navigate to /subterra/portfolio overview and provide feedback that portfolio item was succesfully added
          res.redirect(`/subterra/portfolio?feedback='${ data.title }' was successfully added.&state=positive`);
        });
      } else {
        // Provide feedback that portfolio item title already exisits
        res.redirect(`/subterra/portfolio/add?feedback='Portfolio item with title '${ data.title }' already exists.&state=negative`);
      }
    });
  });
});

// [GET] /subterra/portfolio/edit/:id
router.get('/edit/:id', (req, res) => {
  debug(`[${ req.method }] /subterra/portfolio/edit/${ req.params.id }`);

  req.getConnection((err, connection) => {
    // Select portfolio item with ID from GET parameter
    connection.query(`
      SELECT * FROM portfolio
      WHERE id = '${ req.params.id }'
    `, [], (err, portfolio) => {
      const item = portfolio[0];

      // Fetch all 'course' pages from database
      database.retrieve(connection, {
        category: 'portfolio',
        tables: ['pages'],
        callback: systemData => {
          // Check if a session already exists
          if (req.session.username) {
            res.render('portfolio/edit', {
              username: req.session.username,
              pathname: '/subterra/portfolio',
              feedback: req.query.feedback,
              feedbackState: req.query.state,
              system: systemData,
              item: {
                id: item.id,
                title: item.title,
                courses: item.courses.split(',').filter(e => {
                  // Removes empty data fields
                  return e;
                }),
                paragraph: item.paragraph,
                image: item.image,
                video: item.video
              }
            });
          } else {
            // Provide feedback that login session has ended
            res.redirect(`/subterra/login?feedback=Your login session ended. Log in again below.&state=negative`);
          }
        }
      });
    });
  });
});

// [POST] /subterra/portfolio/edit/:id
router.post('/edit/:id', (req, res) => {
  debug(`[${ req.method }] /subterra/portfolio/edit/${ req.params.id }`);

  const data = {
    title: req.body.title.replace(/'/g, '"'),
    courses: req.body.courses,
    paragraph: req.body['content-p'],
    image: req.body['content-i-name'],
    video: req.body['content-e']
  };

  req.getConnection((err, connection) => {
    // Fetch all menus from database
    connection.query(`
      SELECT * FROM portfolio
    `, [], (err, portfolio) => {
      let exists;

      // Check if portfolio item title already exists
      portfolio.forEach(item => {
        if (item.id != req.params.id && item.title === data.title) {
          exists = true;
        }
      });

      // Check if a session already exists
      if (!req.session.username) {
        // Provide feedback that login session has ended
        res.redirect(`/subterra/login?feedback=Your login session ended. Log in again below.&state=negative`);
      } else if (!exists) {
        // Update portfolio item in database
        connection.query(`
          UPDATE portfolio
          SET ?
          WHERE id = ${ req.params.id }
        `, [data], (err, results) => {
          // Navigate to /subterra/portfolio overview and provide feedback that portfolio item was successfully edited
          res.redirect(`/subterra/portfolio?feedback='${ data.title }' was successfully edited.&state=positive`);
        });
      } else {
        // Provice feedback that portfolio item title already exists
        res.redirect(`/subterra/portfolio/edit/${ req.params.id }?feedback=Portfolio item with title '${ data.title }' already exists.&state=negative`);
      }
    });
  });
});

// [GET] /subterra/portfolio/delete/:id
router.get('/delete/:id', (req, res) => {
  debug(`[${ req.method }] /subterra/portfolio/delete/${ req.params.id }`);

  req.getConnection((err, connection) => {
    // Remove portfolio item from database
    connection.query(`
      DELETE FROM portfolio
      WHERE id = ${ req.params.id }
    `, [], (err, results) => {
      // Redirect to portfolio overview page and provide feedback that portfolio item is successfully deleted
      res.redirect(`/subterra/portfolio?feedback=Successfully deleted portfolio item.&state=positive`);
    });
  });
});

module.exports = router;
