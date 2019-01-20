const createError = require('http-errors');

function isMongoUniqueError(err) {
  return err
    && (err.name === 'BulkWriteError' || err.name === 'MongoError')
    && (err.code === 11000 || err.code === 11001);
}

module.exports = (err, req, res, next) => {
  if (isMongoUniqueError(err)) {
    err = createError(409, 'Resource must be unique');
  }
  next(err);
};
