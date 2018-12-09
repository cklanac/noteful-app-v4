const passport = require("passport");

const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");

const { JWT_SECRET } = require("../config");

const options = {
  secretOrKey: JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("Bearer")
};

const jwtStrategy = new JwtStrategy(options, (payload, done) => {
  done(null, payload.user);
});

passport.use(jwtStrategy);

module.exports = passport.authenticate("jwt", { session: false, failWithError: true });