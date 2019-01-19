const express = require('express');
const createError = require('http-errors');
const debug = require('debug')('app:routes');

const { jwtAuth } = require('../middleware');
const { tag } = require('../services');

const router = express.Router();

router.use(jwtAuth);

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  debug(req.originalUrl);
  const userId = req.user.id;

  tag.findAll(userId)
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  debug(req.originalUrl);
  const { id } = req.params;
  const userId = req.user.id;

  tag.findOne(id, userId)
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  debug(req.originalUrl);
  const { name } = req.body;
  const userId = req.user.id;

  tag.insert({ name }, userId)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = createError(409, `Resource '${name}' must be unique`);
      }
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  debug(req.originalUrl);
  const { id } = req.params;
  const { name } = req.body;
  const userId = req.user.id;

  tag.modify(id, userId, { name })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      if (err.code === 11000) {
        err = createError(409, `Resource '${name}' must be unique`);
      }
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  debug(req.originalUrl);
  const { id } = req.params;
  const userId = req.user.id;

  tag.remove(id, userId)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
