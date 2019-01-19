const faker = require('faker');
const bcrypt = require('bcryptjs');
const debug = require('debug')('app:seed');

const Note = require('../models/note.model');
const Folder = require('../models/folder.model');
const Tag = require('../models/tag.model');
const User = require('../models/user.model');

const PASSWORD = 'P@ssw0rd!';

// used to guarantee unique usernames when seedDb gets run
let USER_INDEX = 1;

function makeUser(password = PASSWORD) {
  // to ensure unique names
  const username = `${faker.internet.userName()}__${USER_INDEX}`;
  USER_INDEX += 1;
  const fullname = `${faker.name.firstName()} ${faker.name.lastName()}`;
  debug('creating new user: %o', username);

  const digest = bcrypt.hashSync(password);

  return new User({
    fullname,
    username,
    password: digest
  });
}

function makeFolder(userId) {
  return new Folder({ name: faker.random.word(), userId });
}

function makeNote(userId, folderId, tags = []) {
  return new Note({
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(2),
    folderId,
    tags,
    userId
  });
}

function makeTag(userId) {
  return new Tag({ name: faker.random.word(), userId });
}

// https://stackoverflow.com/a/1527820
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function makeUserData(numNotes = 10, numFolders = 3, numTags = 3) {
  const notes = [];
  const folders = [];
  const tags = [];

  const user = makeUser();

  for (let i = 0; i < numTags; i++) {
    const tag = makeTag(user.id);
    tags.push(tag);
  }

  for (let i = 0; i < numFolders; i++) {
    const folder = makeFolder(user.id);
    folders.push(folder);
  }

  for (let i = 0; i < numNotes; i++) {
    const noteFolder = folders[getRandomInt(0, folders.length - 1)];
    const noteTags = tags.reduce((acc, tag) => {

      if ((Math.round(Math.random()))) {
        acc.push(tag._id);
      }
      return acc;
    }, []);
    const note = makeNote(user.id, noteFolder.id, noteTags);
    notes.push(note);
  }
  return { user, tags, folders, notes };
}

function makeSeeds(numUsers = 2, numNotes = 10, numFolders = 3, numTags = 3) {
  let users = [];
  let tags = [];
  let folders = [];
  let notes = [];

  for (let i = 0; i < numUsers; i++) {
    const results = makeUserData(numNotes, numFolders, numTags);
    users.push(results.user);
    tags = tags.concat(results.tags);
    folders = folders.concat(results.folders);
    notes = notes.concat(results.notes);

  }

  return { tags, folders, notes, users };
}

module.exports = { makeSeeds };
