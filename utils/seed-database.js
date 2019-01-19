
const { MONGODB_URI } = require('../config');
const db = require('../db/mongoose');

const { Note, Folder, Tag, User } = require('../models');

const { folders, notes, tags, users } = require('../db/data');

console.log(`Connecting to mongodb at ${MONGODB_URI}`);
db.connect(MONGODB_URI)
  .then(() => db.connection.dropDatabase())
  .then(() => {
    console.info('Seeding Database');
    return Promise.all([
      Note.insertMany(notes),
      Folder.insertMany(folders),
      Tag.insertMany(tags),
      User.insertMany(users),

      Note.createIndexes(),
      Folder.createIndexes(),
      Tag.createIndexes(),
      User.createIndexes()
    ]);
  })
  .then(results => {
    console.log('Inserted', results);
    console.info('Disconnecting');
    return db.disconnect();
  })
  .catch(err => {
    console.error(err);
    return db.disconnect();
  });
