const createError = require('http-errors');
const debug = require('debug')('app:auth:jwt');

const jwtHelper = require('../helpers/jwt');
const { JWT_SECRET } = require('../config');

function jwtAuth(req, res, next) {
  const auth = req.header('Authorization');

  if (!auth) {
    debug("'Authorization' header not found");
    const err = createError(401, 'Unauthorized');
    return next(err);
  }

  const scheme = auth.split(' ')[0]; // "Bearer"
  const token = auth.split(' ')[1]; // "token"

  debug('scheme %o', scheme);
  debug('token %o', token);

  if (scheme !== 'Bearer' || !token) {
    debug('no token found');
    const err = createError(401, "No 'Bearer' token found");
    return next(err);
  }

  jwtHelper.verifyToken(token, JWT_SECRET)
    .then(payload => {
      req.user = payload.user;
      debug('authorized %o', req.user);
      next();
    })
    .catch(() => {
      const err = createError(401, 'Unauthorized');
      return next(err);
    });

  // jwt.verify(token, JWT_SECRET, (err, payload) => {
  //   if (err) {
  //     debug("invalid jwt", err);
  //     const err = createError(401, "Unauthorized");
  //     return next(err);
  //   }

  //   req.user = payload.user;
  //   debug("authorized %o", req.user);
  //   next();
  // });
}

module.exports = jwtAuth;
