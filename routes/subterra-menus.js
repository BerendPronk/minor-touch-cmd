const debug = require('debug')('TouchCMD');
const express = require('express');
const router = express.Router();

// [GET] /subterra/menus
router.get('/', (req, res) => {
  debug(`[${ req.method }] /subterra/menus`);

  // Checks if a session already exists
  if (req.session.username) {
    res.render('subterra/menus/index', {
      username: req.session.username,
      pathname: '/subterra/menus'
    });
  } else {
    res.redirect('/subterra/login');
  }
});

// [GET] /subterra/menus/add
router.get('/add', (req, res) => {
  debug(`[${ req.method }] /subterra/menus/add`);

  // Checks if a session already exists
  if (req.session.username) {
    res.render('subterra/menus/add', {
      username: req.session.username,
      pathname: '/subterra/menus'
    });
  } else {
    res.redirect('/subterra/login');
  }
});

// [GET] /subterra/menus/edit/:id
router.get('/edit/:id', (req, res) => {
  debug(`[${ req.method }] /subterra/menus/edit/${ req.params.id }`);

  // Checks if a session already exists
  if (req.session.username) {
    res.render('subterra/menus/edit', {
      username: req.session.username,
      pathname: '/subterra/menus'
    });
  } else {
    res.redirect('/subterra/login');
  }
});

// [POST] /subterra/menus/edit/:id
router.post('/edit/:id', (req, res) => {
  debug(`[${ req.method }] /subterra/menus/edit/${ req.params.id }`);

  // Redirect to same page with newly added data
  res.redirect(`/subterra/menus/edit/${ req.params.id }`);
});

module.exports = router;
