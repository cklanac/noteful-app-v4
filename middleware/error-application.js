const logger = require('../helpers/winston');

module.exports = (err, req, res, next) => {
  logger.error(`${500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  res.status(500).json({ message: 'Internal Server Error' });
};
