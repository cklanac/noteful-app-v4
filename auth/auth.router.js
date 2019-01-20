const express = require('express');
const debug = require('debug')('app:routes');

const { localAuth, jwtAuth } = require('../middleware');
const { signToken } = require('../helpers/jwt');
const { JWT_SECRET, JWT_EXPIRY } = require('../config');

const router = express.Router();

router.post('/login', localAuth, (req, res) => {
  debug('login %o', req.user);
  const token = signToken(req.user, JWT_SECRET, JWT_EXPIRY);
  res.json({ token });
});

router.post('/refresh', jwtAuth, (req, res) => {
  debug('refresh %o', req.user);
  const token = signToken(req.user, JWT_SECRET, JWT_EXPIRY);
  res.json({ token });
});

module.exports = router;
