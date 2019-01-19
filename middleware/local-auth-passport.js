const passport = require('passport');
const bcrypt = require('bcryptjs');
const createError = require('http-errors');
const debug = require('debug')('app:auth:local');
const { Strategy: LocalStrategy } = require('passport-local');

const User = require('../models/user.model');

const localStrategy = new LocalStrategy((username, password, done) => {
  let user;

  debug('authenticate %o', username);
  User.findOne({ username })
    .then(results => {
      user = results;
      if (!user) {
        debug("username '%o' not found ", username);
        const err = createError(401, 'Invalid credentials');
        return Promise.reject(err);
      }
      return bcrypt.compare(password, user.password);
    })
    .then(isValid => {
      if (!isValid) {
        debug("password for '%0' not valid", username);
        const err = createError(401, 'Invalid credentials');
        return Promise.reject(err);
      }

      debug('authenticated %o', user);
      done(null, user);
    })
    .catch(err => {
      return done(err);
    });
});

passport.use(localStrategy);

module.exports = passport.authenticate('local', { session: false, failWithError: true });
