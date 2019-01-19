const express = require('express');
const debug = require('debug')('app:routes');

const { jwtAuth } = require('../middleware');
const { note } = require('../services');

const router = express.Router();

router.use(jwtAuth);

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  debug(req.originalUrl);
  const userId = req.user.id;

  note.findAll(userId, req.query)
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

  note.findOne(id, userId)
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
  const { title, content, folderId, tags } = req.body;
  const userId = req.user.id;

  const newNote = { title, content, folderId, tags, userId };

  note.insert(newNote, userId)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  debug(req.originalUrl);
  const { id } = req.params;
  const userId = req.user.id;

  const toUpdate = {};
  const updateableFields = ['title', 'content', 'folderId', 'tags'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  return note.modify(id, userId, toUpdate)
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

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  debug(req.originalUrl);
  const { id } = req.params;
  const userId = req.user.id;

  note.remove(id, userId)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
