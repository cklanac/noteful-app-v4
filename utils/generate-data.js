const fs = require('fs');
const path = require('path');
const debug = require('debug')('app:seed');

const fakeData = require('./fake-data');

const seed = fakeData.makeSeeds();

const dest = path.join(process.cwd(), '/test/test-data.json');

fs.writeFile(dest, JSON.stringify(seed, null, 2), () => {
  console.log('dataSet saved to %o', dest);
  debug('dataSet saved to %o', dest);
});
