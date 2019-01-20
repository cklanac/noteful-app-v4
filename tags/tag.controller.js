// Maps request to service and handles response

const tagService = require('./tag.service');

exports.findAll = (req, res, next) => {
  const userId = req.user.id;
  tagService.findAll(userId)
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

  tagService.findOne(id, userId)
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

  tagService.insert({ name }, userId)
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

  tagService.modify(id, userId, { name })
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

exports.remove = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  tagService.remove(id, userId)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
};
