const passport = require('passport');
const debug = require('debug')('app:auth:jwt');

const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const { JWT_SECRET } = require('../config');

const options = {
  secretOrKey: JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer')
};

const jwtStrategy = new JwtStrategy(options, (payload, done) => {
  debug('authorized %o', payload.user);
  done(null, payload.user);
});

passport.use(jwtStrategy);

module.exports = passport.authenticate('jwt', { session: false, failWithError: true });
