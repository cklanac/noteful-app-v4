const createError = require('http-errors');
const folderService = require('./folder.service');

exports.findAll = (req, res, next) => {
  const userId = req.user.id;

  folderService.findAll(userId)
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
};

exports.findOne = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  folderService.findOne(id, userId)
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
};

exports.insert = (req, res, next) => {
  const { name } = req.body;
  const userId = req.user.id;

  folderService.insert(name, userId)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      next(err);
    });
};

exports.modify = (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  const userId = req.user.id;

  folderService.modify(id, userId, { name })
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
};

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
exports.remove = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  folderService.remove(id, userId)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
};
