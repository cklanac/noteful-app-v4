const jwt = require('jsonwebtoken');
const debug = require('debug')('app:helper:jwt');

function signToken(user, secret, expiry) {
  debug('create token %o', user);
  return jwt.sign({ user }, secret, {
    subject: user.username,
    expiresIn: expiry
  });
}

function verifyToken(token, secret) {
  return new Promise((resolve, reject) => {
    debug('verify token %o', token);
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      return resolve(decoded);
    });
  });
}

module.exports = { signToken, verifyToken };
