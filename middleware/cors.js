const cors = require('cors');

const whitelist = ['http://notefulapp.heroku.com', 'http://notefulapp-demo.heroku.com', 'http://notefulapp-test.heroku.com'];

var options = {
  origin: (origin, callback) => {
    if (origin && whitelist.indexOf(origin) === -1) {
      callback(new Error('Not allowed by CORS'));
    } else {
      callback(null, true);
    }
  }
};

module.exports = cors(options);
