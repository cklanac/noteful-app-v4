const bcrypt = require('bcryptjs');
const createError = require('http-errors');
const debug = require('debug')('app:auth:local');

const User = require('../users/user.model');

function localAuth(req, res, next) {
  const { username, password } = req.body;
  let user;

  if (!username || !password) {
    debug('missing provided');
    const err = createError(400, 'Bad Request');
    return next(err);
  }

  debug('authenticate %o', username);
  return User.findOne({ username })
    .then(_user => {
      user = _user;

      if (!user) {
        debug("username '%o' not found ", username);
        const err = createError(401, 'Invalid credentials');
        err.location = 'username';
        return Promise.reject(err);
      }

      return bcrypt.compare(password, user.password);
    })
    .then(isValid => {

      if (!isValid) {
        debug("password for '%0' not valid", username);
        const err = createError(401, 'Invalid credentials');
        err.location = 'password';
        return Promise.reject(err);
      }
      req.user = user;
      debug('authenticated %o', req.user);
      next();
    })
    .catch((err) => {
      next(err);
    });
}

module.exports = localAuth;
