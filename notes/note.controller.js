const noteService = require('./note.service');

exports.findAll = (req, res, next) => {
  const userId = req.user.id;

  noteService.findAll(userId, req.query)
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

  noteService.findOne(id, userId)
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
  const { title, content, folderId, tags } = req.body;
  const userId = req.user.id;

  const newNote = { title, content, folderId, tags, userId };
  noteService.insert(newNote, userId)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      next(err);
    });
};

exports.modify = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const toUpdate = {};
  const updateableFields = ['title', 'content', 'folderId', 'tags'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  return noteService.modify(id, userId, toUpdate)
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

  noteService.remove(id, userId)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
};
