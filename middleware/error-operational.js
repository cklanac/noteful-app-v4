const logger = require('../helpers/winston');
const createError = require('http-errors');

module.exports = (err, req, res, next) => {
  if (err instanceof createError.HttpError) {
    const errBody = Object.assign({}, err, { message: err.message });
    logger.error(`${err.status || 400} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    return res.status(err.status || 400).json(errBody);
  }
  next(err);
};
