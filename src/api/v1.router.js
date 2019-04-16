'use strict';

const router = require('express').Router();

// Home page
router.get('/', rootHandler);

function rootHandler(req, res) {
  res
    .status(200)
    .send(
      'Welcome to the Hubbub server!\nDownload the client at https://github.com/hub-up/hub-front-end'
    );
}

module.exports = router;
