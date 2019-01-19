const debug = require('debug')('app:err');
const createError = require('http-errors');

module.exports = (req, res, next) => {
  const err = createError(404, 'Not Found');
  next(err);
};
