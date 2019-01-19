const debug = require('debug');

const httpDebug = debug('app:http');
const initDebug = debug('app:init');
const errDebug = debug('app:err');
const routesDebug = debug('app:routes');
const dbDebug = debug('app:db');
const helperDebug = debug('app:helper');
const testDebug = debug('app:test');


module.exports = {
  httpDebug,
  initDebug,
  errDebug,
  routesDebug,
  dbDebug,
  helperDebug,
  testDebug
};
