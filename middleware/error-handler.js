const debug = require('debug')('app:err');

module.exports = (err, req, res, next) => {
  debug(err);
  // if (err instanceof createError.HttpError) {
  if (err.status) {
    const errBody = Object.assign({}, err, { message: err.message });
    res.status(err.status).json(errBody);
  } else {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
