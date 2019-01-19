const http = require('http');
const app = require('./app');
const db = require('./db/mongoose');
const debug = require('debug')('app:http');

const { PORT, MONGODB_URI } = require('./config');

db.connect(MONGODB_URI)
  .then(mongoose => {
    const { host, port, name } = mongoose.connection;
    console.info(`Connected to: mongodb://${host}:${port}/${name}`);
  })
  .catch(err => {
    debug(err);
  });

http.createServer(app)
  .listen(PORT, function () {
    debug(`listening on ${this.address().port}`);
  }).on('error', err => {
    debug(err);
  });
