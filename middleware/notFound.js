const debug = require("debug")("app:err");

(req, res, next) => {
  const err = createError(404, 'Not Found');
  next(err);
}
