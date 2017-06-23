const debug = require('debug')('TouchCMD');
const database = require('../../subterra/assets/script/modules/database');
const express = require('express');
const router = express.Router();

// [GET] /subterra/faq
router.get('/', (req, res) => {
  debug(`[${ req.method }] /subterra/faq`);

  // Object containing system data, after MySQL query
  let system = {
    faq: []
  };

  req.getConnection((err, connection) => {
    // Fetch all FAQ questions from database
    connection.query(`
      SELECT * FROM faq
    `, [], (err, faq) => {
      // Push FAQ questions in system object
      faq.forEach(question => {
        system.faq.push({
          id: question.id,
          question: question.question
        });
      });

      // Check if a session already exists
      if (req.session.username) {
        res.render('faq/index', {
          username: req.session.username,
          pathname: '/subterra/faq',
          feedback: req.query.feedback,
          feedbackState: req.query.state,
          system: {
            faq: system.faq
          }
        });
      } else {
        // Provide feedback that login session has ended
        res.redirect(`/subterra/login?feedback=Your login session ended. Log in again below.&state=negative`);
      }
    });
  });
});

// [GET] /subterra/faq/add
router.get('/add', (req, res) => {
  debug(`[${ req.method }] /subterra/faq/add`);

  // Check if a session already exists
  if (req.session.username) {
    res.render('faq/add', {
      username: req.session.username,
      pathname: '/subterra/faq',
      feedback: req.query.feedback,
      feedbackState: req.query.state
    });
  } else {
    // Provide feedback that login session has ended
    res.redirect(`/subterra/login?feedback=Your login session ended. Log in again below.&state=negative`);
  }
});

// [POST] /subterra/faq/add
router.post('/add', (req, res) => {
  debug(`[${ req.method }] /subterra/faq/add`);

  const data = {
    question: req.body.question.replace(/'/g, '"'),
    answer: req.body.answer
  };

  req.getConnection((err, connection) => {
    // Fetch all FAQ questions from database
    connection.query(`
      SELECT * FROM faq
    `, [], (err, faq) => {
      let exists;

      // Check if FAQ question already exists
      faq.forEach(question => {
        if (question.question.toLowerCase() === data.question.toLowerCase()) {
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
          INSERT INTO faq SET ?
        `, [data], (err, log) => {
          // Navigate to /subterra/faq overview and provide feedback that faq question was succesfully added
          res.redirect(`/subterra/faq?feedback=FAQ question was successfully added.&state=positive`);
        });
      } else {
        // Provide feedback that FAQ question already exisits
        res.redirect(`/subterra/faq/add?feedback=FAQ question with this title already exists.&state=negative`);
      }
    });
  });
});

// [GET] /subterra/faq/edit/:id
router.get('/edit/:id', (req, res) => {
  debug(`[${ req.method }] /subterra/faq/edit/${ req.params.id }`);

  req.getConnection((err, connection) => {
    // Select FAQ question with ID from GET parameter
    connection.query(`
      SELECT * FROM faq
      WHERE id = '${ req.params.id }'
    `, [], (err, faq) => {
      const question = faq[0];

      // Check if a session already exists
      if (req.session.username) {
        res.render('faq/edit', {
          username: req.session.username,
          pathname: '/subterra/faq',
          feedback: req.query.feedback,
          feedbackState: req.query.state,
          question: {
            id: question.id,
            question: question.question,
            answer: question.answer
          }
        });
      } else {
        // Provide feedback that login session has ended
        res.redirect(`/subterra/login?feedback=Your login session ended. Log in again below.&state=negative`);
      }
    });
  });
});

// [POST] /subterra/faq/edit/:id
router.post('/edit/:id', (req, res) => {
  debug(`[${ req.method }] /subterra/faq/edit/${ req.params.id }`);

  const data = {
    question: req.body.question.replace(/'/g, '"'),
    answer: req.body.answer
  };

  req.getConnection((err, connection) => {
    // Fetch all FAQ questions from database
    connection.query(`
      SELECT * FROM faq
    `, [], (err, faq) => {
      let exists;

      // Check if FAQ question already exists
      faq.forEach(question => {
        if (question.id != req.params.id && question.question.toLowerCase() === data.question.toLowerCase()) {
          exists = true;
        }
      });

      // Check if a session already exists
      if (!req.session.username) {
        // Provide feedback that login session has ended
        res.redirect(`/subterra/login?feedback=Your login session ended. Log in again below.&state=negative`);
      } else if (!exists) {
        // Update FAQ question in database
        connection.query(`
          UPDATE faq
          SET ?
          WHERE id = ${ req.params.id }
        `, [data], (err, log) => {
          // Navigate to /subterra/faq overview and provide feedback that FAQ question was successfully edited
          res.redirect(`/subterra/faq?feedback=FAQ question was successfully edited.&state=positive`);
        });
      } else {
        // Provice feedback that FAQ question already exists
        res.redirect(`/subterra/faq/edit/${ req.params.id }?feedback=FAQ question with this title already exists.&state=negative`);
      }
    });
  });
});

// [GET] /subterra/faq/delete/:id
router.get('/delete/:id', (req, res) => {
  debug(`[${ req.method }] /subterra/faq/delete/${ req.params.id }`);

  req.getConnection((err, connection) => {
    // Remove faq question from database
    connection.query(`
      DELETE FROM faq
      WHERE id = ${ req.params.id }
    `, [], (err, log) => {
      // Redirect to faq overview page and provide feedback that faq question is successfully deleted
      res.redirect(`/subterra/faq?feedback=Successfully deleted the FAQ question.&state=positive`);
    });
  });
});

module.exports = router;
