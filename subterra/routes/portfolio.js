const debug = require('debug')('TouchCMD');
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

      // Checks if a session already exists
      if (req.session.username) {
        res.render('portfolio/index', {
          username: req.session.username,
          pathname: '/subterra/portfolio',
          system: {
            portfolio: system.portfolio
          }
        });
      } else {
        res.redirect('/subterra/login');
      }
    });
  });
});

// [GET] /subterra/portfolio/add
router.get('/add', (req, res) => {
  debug(`[${ req.method }] /subterra/portfolio/add`);

  // Object containing system data, after MySQL queries
  let system = {
    courses: []
  };

  req.getConnection((err, connection) => {
    // Fetch all 'course' pages from database
    connection.query(`
      SELECT * FROM pages
      WHERE type = 'course'
    `, [], (err, courses) => {
      // Push pages in system object
      courses.forEach(course => {
        system.courses.push(course.title);
      });

      // Checks if a session already exists
      if (req.session.username) {
        res.render('portfolio/add', {
          username: req.session.username,
          pathname: '/subterra/portfolio',
          feedback: false,
          feedbackState: false,
          system: {
            courses: system.courses
          }
        });
      } else {
        res.redirect('/subterra/login');
      }
    });
  });
});

// [POST] /subterra/portfolio/add
router.post('/add', (req, res) => {
  debug(`[${ req.method }] /subterra/portfolio/add`);

  // Object containing system data, after MySQL queries
  let system = {
    courses: []
  };

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

      if (!exists) {
        // Add submitted data to database
        connection.query(`
          INSERT INTO portfolio SET ?
        `, [data], (err, results) => {
          // Navigate to /subterra/portfolio overview
          res.redirect('/subterra/portfolio');
        });
      } else {
        // Fetch all 'course' pages from database
        connection.query(`
          SELECT * FROM pages
          WHERE type = 'course'
        `, [], (err, courses) => {
          // Push pages in system object
          courses.forEach(course => {
            system.courses.push(course.title);
          });

          res.render('portfolio/add', {
            username: req.session.username,
            pathname: '/subterra/portfolio',
            feedback: `Portfolio item with title '${ data.title }' already exists.`,
            feedbackState: 'negative',
            system: {
              courses: system.courses
            }
          });
        });
      }
    });
  });
});

// [GET] /subterra/portfolio/edit/:id
router.get('/edit/:id', (req, res) => {
  debug(`[${ req.method }] /subterra/portfolio/edit/${ req.params.id }`);

  // Object containing system data, after MySQL queries
  let system = {
    courses: []
  };

  req.getConnection((err, connection) => {
    // Select portfolio item with ID from GET parameter
    connection.query(`
      SELECT * FROM portfolio
      WHERE id = '${ req.params.id }'
    `, [], (err, portfolio) => {
      const item = portfolio[0];

      // Fetch all 'course' pages from database
      connection.query(`
        SELECT * FROM pages
        WHERE type = 'course'
      `, [], (err, courses) => {
        courses.forEach(course => {
          system.courses.push(course.title);
        });

        // Checks if a session already exists
        if (req.session.username) {
          res.render('portfolio/edit', {
            username: req.session.username,
            pathname: '/subterra/portfolio',
            feedback: false,
            feedbackState: false,
            system: {
              courses: system.courses
            },
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
          res.redirect('/subterra/login');
        }
      });
    });
  });
});

// [POST] /subterra/portfolio/edit/:id
router.post('/edit/:id', (req, res) => {
  debug(`[${ req.method }] /subterra/portfolio/edit/${ req.params.id }`);

  // Object containing system data, after MySQL queries
  let system = {
    courses: []
  };

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

      if (!exists) {
        // Update portfolio item in database
        connection.query(`
          UPDATE portfolio
          SET ?
          WHERE id = ${ req.params.id }
        `, [data], (err, results) => {
          // Navigate to /subterra/portfolio overview
          res.redirect('/subterra/portfolio');
        });
      } else {
        // Select portfolio item with ID from GET parameter
        connection.query(`
          SELECT * FROM portfolio
          WHERE id = '${ req.params.id }'
        `, [], (err, portfolio) => {
          const item = portfolio[0];

          // Fetch all 'course' pages from database
          connection.query(`
            SELECT * FROM pages
            WHERE type = 'course'
          `, [], (err, courses) => {
            courses.forEach(course => {
              system.courses.push(course.title);
            });

            res.render('portfolio/edit', {
              username: req.session.username,
              pathname: '/subterra/portfolio',
              feedback: `Portfolio item with title '${ data.title }' already exists.`,
              feedbackState: 'negative',
              system: {
                courses: system.courses
              },
              item: {
                id: data.id,
                title: data.title,
                courses: data.courses.split(',').filter(e => {
                  // Removes empty data fields
                  return e;
                }),
                paragraph: data.paragraph,
                image: data.image,
                video: data.video
              }
            });
          });
        });
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
      // Redirect to portfolio overview page
      res.redirect('/subterra/portfolio');
    });
  });
});

module.exports = router;
