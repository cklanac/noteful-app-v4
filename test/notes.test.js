const chai = require('chai');
const sinon = require('sinon');
const express = require('express');
const jwt = require('jsonwebtoken');
const chaiHttp = require('chai-http');

const app = require('../app');
const data = require('./data');
const db = require('../db/mongoose');

const { Tag, Note, Folder, User } = require('../models');

const { TEST_MONGODB_URI, JWT_SECRET } = require('../config');

chai.use(chaiHttp);

const expect = chai.expect;
const sandbox = sinon.createSandbox();

describe('Noteful API - Notes', function () {

  let token, user, user2;

  before(function () {
    return db.connect(TEST_MONGODB_URI)
      .then(() => db.connection.dropDatabase());
  });

  beforeEach(function () {
    return Promise.all([
      User.insertMany(data.users),
      Note.insertMany(data.notes),
      Folder.insertMany(data.folders),
      Tag.insertMany(data.tags),
      Tag.createIndexes(),
      Folder.createIndexes()
    ])
      .then(([users]) => {
        user = users[0];
        user2 = users[1];
        token = jwt.sign({ user }, JWT_SECRET, { subject: user.username });
      });
  });

  afterEach(function () {
    sandbox.restore();
    return Promise.all([
      User.deleteMany(),
      Note.deleteMany(),
      Folder.deleteMany(),
      Tag.deleteMany(),
    ]);
  });

  after(function () {
    return db.connection.dropDatabase()
      .then(() => db.disconnect());
  });

  describe('GET /api/notes', function () {

    it('should return the correct number of Notes', function () {
      return Promise.all([
        Note.find({ userId: user.id }),
        chai.request(app)
          .get('/api/notes')
          .set('Authorization', `Bearer ${token}`)
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should return a list sorted desc with the correct right fields', function () {
      return Promise.all([
        Note.find({ userId: user.id }).sort({ updatedAt: 'desc' }),
        chai.request(app)
          .get('/api/notes')
          .set('Authorization', `Bearer ${token}`)
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          res.body.forEach(function (item, i) {
            expect(item).to.be.a('object');
            // Note: folderId, tags and content are optional
            expect(item).to.include.all.keys('id', 'title', 'createdAt', 'updatedAt', 'userId');
            expect(item.id).to.equal(data[i].id);
            expect(item.title).to.equal(data[i].title);
            expect(item.content).to.equal(data[i].content);
            expect(item.userId).to.equal(data[i].userId.toString());
            expect(new Date(item.createdAt)).to.eql(data[i].createdAt);
            expect(new Date(item.updatedAt)).to.eql(data[i].updatedAt);
          });
        });
    });

    it('should return correct search results for a searchTerm query', function () {
      const searchTerm = 'lady gaga';

      const re = new RegExp(searchTerm, 'i');
      const dbPromise = Note
        .find({
          userId: user.id,
          $or: [{ title: re }, { content: re }]
        })
        .sort({ updatedAt: 'desc' });

      const apiPromise = chai.request(app)
        .get(`/api/notes?searchTerm=${searchTerm}`)
        .set('Authorization', `Bearer ${token}`);

      return Promise.all([dbPromise, apiPromise])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          res.body.forEach(function (item, i) {
            expect(item).to.be.a('object');
            expect(item).to.include.all.keys('id', 'title', 'createdAt', 'updatedAt', 'tags'); // Note: folderId and content are optional
            expect(item.id).to.equal(data[i].id);
            expect(item.title).to.equal(data[i].title);
            expect(item.content).to.equal(data[i].content);
            expect(new Date(item.createdAt)).to.eql(data[i].createdAt);
            expect(new Date(item.updatedAt)).to.eql(data[i].updatedAt);
          });
        });
    });

    it('should return correct search results for content search', function () {
      const searchTerm = 'lorem ipsum';
      const re = new RegExp(searchTerm, 'i');
      const dbPromise = Note
        .find({
          userId: user.id,
          $or: [{ title: re }, { content: re }]
        })
        .sort({ updatedAt: 'desc' });
      const apiPromise = chai.request(app)
        .get(`/api/notes?searchTerm=${searchTerm}`)
        .set('Authorization', `Bearer ${token}`);

      return Promise.all([dbPromise, apiPromise])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          res.body.forEach(function (item, i) {
            expect(item).to.be.a('object');
            expect(item).to.include.all.keys('id', 'title', 'createdAt', 'updatedAt', 'tags'); // Note: folderId and content are optional
            expect(item.id).to.equal(data[i].id);
            expect(item.title).to.equal(data[i].title);
            expect(item.content).to.equal(data[i].content);
            expect(new Date(item.createdAt)).to.eql(data[i].createdAt);
            expect(new Date(item.updatedAt)).to.eql(data[i].updatedAt);
          });
        });
    });

    it('should return correct search results for a folderId query', function () {
      let data;
      return Folder.findOne()
        .then((_data) => {
          data = _data;
          return Promise.all([
            Note.find({ folderId: data.id, userId: user.id }),
            chai.request(app)
              .get(`/api/notes?folderId=${data.id}`)
              .set('Authorization', `Bearer ${token}`)
          ]);
        })
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should return correct search results for a tagId query', function () {
      let data;
      return Tag.findOne()
        .then((_data) => {
          data = _data;
          return Promise.all([
            Note.find({ tags: data.id, userId: user.id, }),
            chai.request(app)
              .get(`/api/notes?tagId=${data.id}`)
              .set('Authorization', `Bearer ${token}`)
          ]);
        })
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should return an empty array for an incorrect query', function () {
      const searchTerm = 'NOT-A-VALID-QUERY';
      const re = new RegExp(searchTerm, 'i');
      const dbPromise = Note.find({
        userId: user.id,
        $or: [{ title: re }, { content: re }]
      }).sort({ updatedAt: 'desc' });

      const apiPromise = chai.request(app)
        .get(`/api/notes?searchTerm=${searchTerm}`)
        .set('Authorization', `Bearer ${token}`);

      return Promise.all([dbPromise, apiPromise])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should catch errors and respond properly', function () {
      sandbox.stub(db.get('toJSON'), 'transform').throws();

      return chai.request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(500);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Internal Server Error');
        });
    });

  });

  describe('GET /api/notes/:id', function () {

    it('should return correct notes', function () {
      let data;
      return Note.findOne({ userId: user.id })
        .then(_data => {
          data = _data;
          return chai.request(app)
            .get(`/api/notes/${data.id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          // Note: folderId, tags and content are optional
          expect(res.body).to.include.all.keys('id', 'title', 'createdAt', 'updatedAt', 'userId');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(res.body.userId).to.equal(data.userId.toString());
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should respond with status 400 and an error message when `id` is not valid', function () {
      return chai.request(app)
        .get('/api/notes/NOT-A-VALID-ID')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal("Field 'id' must be a Mongo ObjectId");
        });
    });

    it('should respond with a 404 for an id that does not exist', function () {
      // The string "DOESNOTEXIST" is 12 bytes which is a valid Mongo ObjectId
      return chai.request(app)
        .get('/api/notes/DOESNOTEXIST')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should catch errors and respond properly', function () {
      sandbox.stub(db.get('toJSON'), 'transform').throws();

      return Note.findOne()
        .then(data => {
          return chai.request(app)
            .get(`/api/notes/${data.id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(500);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Internal Server Error');
        });
    });

  });

  /*
    √ folderId required, valid, ownership
    folderId null
    folderId ''
    folderId NOT-VALID
    folderId does not belong to you
    folderId cannot be unset
  */
  describe('POST /api/notes', function () {

    it('should create and return a new item when provided title and folderId', function () {
      let newItem, res;
      return Folder.findOne({ userId: user.id })
        .then(result => {
          newItem = {
            title: 'The best article about cats ever!',
            folderId: result.id
          };
          return chai.request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send(newItem);
        })
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys('id', 'title', 'folderId', 'createdAt', 'updatedAt', 'tags', 'userId');
          return Note.findOne({ _id: res.body.id, userId: user.id });
        })
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(res.body.userId).to.equal(data.userId.toString());
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should create and return a new item when provided title, content, and folderId', function () {
      let newItem, res;
      return Folder.findOne({ userId: user.id })
        .then(result => {
          newItem = {
            title: 'The best article about cats ever!',
            content: 'Lorem ipsum dolor sit amet...',
            folderId: result.id
          };
          return chai.request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send(newItem);
        })
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys('id', 'title', 'content', 'folderId', 'createdAt', 'updatedAt', 'tags', 'userId');
          return Note.findOne({ _id: res.body.id, userId: user.id });
        })
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(res.body.userId).to.equal(data.userId.toString());
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should return an error when missing "folderId" field', function () {
      const newItem = {
        title: 'The best article about cats ever!',
      };
      return chai.request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send(newItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('The `folderId` is not valid');
        });
    });

    it('should return an error when missing "folderId" empty string', function () {
      const newItem = {
        title: 'The best article about cats ever!',
        folderId: ''
      };
      return chai.request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send(newItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `folderId` in request body');
        });
    });

    it('should return an error when missing "title" field', function () {
      let newItem;
      return Folder.findOne({ userId: user.id })
        .then(result => {
          newItem = {
            folderId: result.id
          };
          return chai.request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send(newItem);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `title` in request body');
        });
    });

    it('should return an error when "title" is empty string', function () {
      let newItem;
      return Folder.findOne({ userId: user.id })
        .then(result => {
          newItem = {
            title: '',
            folderId: result.id
          };
          return chai.request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send(newItem);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `title` in request body');
        });
    });

    it('should return an error when `folderId` is not valid ', function () {
      const newItem = {
        title: 'What about dogs?!',
        folderId: 'NOT-A-VALID-ID'
      };
      return chai.request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send(newItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('The `folderId` is not valid');
        });
    });

    it('should create and return a new item when provided title and folderId', function () {
      let newItem;
      return Folder.findOne({ userId: user2.id })
        .then(result => {
          newItem = {
            title: 'The best article about cats ever!',
            folderId: result.id
          };
          return chai.request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send(newItem);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('The `folderId` is not valid');
        });
    });

    it('should return an error when a tag `id` is not valid ', function () {

      let newItem;
      return Folder.findOne({ userId: user.id })
        .then(result => {
          newItem = {
            title: 'The best article about cats ever!',
            content: 'Lorem ipsum dolor sit amet...',
            folderId: result.id,
            tags: ['NOT-A-VALID-ID']
          };
          return chai.request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send(newItem);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('The `tags` array contains an invalid `id`');
        });
    });

    it('should catch errors and respond properly', function () {
      sandbox.stub(db.get('toJSON'), 'transform').throws();

      let newItem;
      return Folder.findOne({ userId: user.id })
        .then(result => {
          newItem = {
            title: 'The best article about cats ever!',
            content: 'Lorem ipsum dolor sit amet...',
            folderId: result.id
          };
          return chai.request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send(newItem);
        })
        .then(res => {
          expect(res).to.have.status(500);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Internal Server Error');
        });
    });

  });

  describe('PUT /api/notes/:id', function () {

    it('should update the note when provided a valid title', function () {
      const updateItem = {
        title: 'What about dogs?!'
      };
      let data;
      return Note.findOne({ userId: user.id }).populate('tags')
        .then(_data => {
          data = _data;
          return chai.request(app)
            .put(`/api/notes/${data.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateItem);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(updateItem.title);
          expect(res.body.content).to.equal(data.content);
          res.body.tags.forEach((tag, i) => {
            expect(tag.id).to.equal(data.tags[i].id);
          });
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.greaterThan(data.updatedAt);
        });
    });

    it('should update the note when provided valid content', function () {
      const updateItem = { content: 'Lorem ipsum dolor sit amet...' };
      let data;
      return Note.findOne({ userId: user.id })
        .then(_data => {
          data = _data;
          return chai.request(app)
            .put(`/api/notes/${data.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateItem);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(updateItem.content);
          expect(res.body.folderId).to.equal(data.folderId.toString());
          res.body.tags.forEach((tag, i) => {
            expect(tag.id).to.equal(data.tags[i]._id.toString());
          });
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.greaterThan(data.updatedAt);
        });
    });

    it('should update the note when provided a valid folderId', function () {
      const updateItem = {};
      let data;

      return Promise.all([
        Folder.findOne({ userId: user.id }),
        Note.findOne({ userId: user.id })
      ])
        .then(([folder, note]) => {
          updateItem.folderId = folder.id;
          data = note;
          return chai.request(app)
            .put(`/api/notes/${note.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateItem);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(res.body.folderId).to.equal(updateItem.folderId.toString());
          res.body.tags.forEach((tag, i) => {
            expect(tag.id).to.equal(data.tags[i]._id.toString());
          });
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.greaterThan(data.updatedAt);
        });
    });

    it('should update the note when provided a valid tag', function () {
      const updateItem = { tags: [] };
      let data;
      const assert = require('assert');
      return Promise.all([
        Tag.findOne({ userId: user.id }),
        Note.findOne({ userId: user.id })
      ])
        .then(([tag, note]) => {
          updateItem.tags.push(tag.id);
          data = note;
          return chai.request(app)
            .put(`/api/notes/${note.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateItem);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(res.body.folderId).to.equal(data.folderId.toString());
          res.body.tags.forEach((tag, i) => {
            expect(tag.id).to.equal(data.tags[i]._id.toString());
          });
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.greaterThan(data.updatedAt);
        });
    });

    it('should respond with status 400 and an error message when `id` is not valid', function () {
      const updateItem = {
        title: 'What about dogs?!',
        content: 'Lorem ipsum dolor sit amet, sed do eiusmod tempor...'
      };
      return chai.request(app)
        .put('/api/notes/NOT-A-VALID-ID')
        .set('Authorization', `Bearer ${token}`)
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal("Field 'id' must be a Mongo ObjectId");
        });
    });

    it('should respond with a 404 for an id that does not exist', function () {
      // The string "DOESNOTEXIST" is 12 bytes which is a valid Mongo ObjectId
      const updateItem = {
        title: 'What about dogs?!',
        content: 'Lorem ipsum dolor sit amet, sed do eiusmod tempor...'
      };
      return chai.request(app)
        .put('/api/notes/DOESNOTEXIST')
        .set('Authorization', `Bearer ${token}`)
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should return an error when "title" is an empty string', function () {
      const updateItem = { title: '' };
      let data;
      return Note.findOne({ userId: user.id })
        .then(_data => {
          data = _data;
          return chai.request(app)
            .put(`/api/notes/${data.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateItem);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `title` in request body');
        });
    });

    it('should return an error when `folderId` is not valid ', function () {
      const updateItem = {
        folderId: 'NOT-A-VALID-ID'
      };
      return Note.findOne({ userId: user.id })
        .then(data => {
          return chai.request(app)
            .put(`/api/notes/${data.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateItem);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('The `folderId` is not valid');
        });
    });

    it('should return an error when a tags `id` is not valid ', function () {
      const updateItem = {
        tags: ['NOT-A-VALID-ID']
      };
      return Note.findOne({ userId: user.id })
        .then(data => {
          return chai.request(app)
            .put(`/api/notes/${data.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateItem);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('The `tags` array contains an invalid `id`');
        });
    });

    it('should catch errors and respond properly', function () {
      sandbox.stub(db.get('toJSON'), 'transform').throws();

      const updateItem = {
        title: 'What about dogs?!',
        content: 'Lorem ipsum dolor sit amet, sed do eiusmod tempor...'
      };
      return Note.findOne()
        .then(data => {
          return chai.request(app)
            .put(`/api/notes/${data.id}`)
            .send(updateItem)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(500);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Internal Server Error');
        });
    });
  });

  describe('DELETE /api/notes/:id', function () {

    it('should delete an existing document and respond with 204', function () {
      let data;
      return Note.findOne({ userId: user.id })
        .then(_data => {
          data = _data;

          return chai.request(app)
            .delete(`/api/notes/${data.id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
          return Note.countDocuments({ _id: data.id });
        })
        .then(count => {
          expect(count).to.equal(0);
        });
    });

    it('should respond with a 400 for an invalid id', function () {
      return chai.request(app)
        .delete('/api/notes/NOT-A-VALID-ID')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal("Field 'id' must be a Mongo ObjectId");
        });
    });

    it('should catch errors and respond properly', function () {
      sandbox.stub(express.response, 'sendStatus').throws();

      return Note.findOne()
        .then(data => {
          return chai.request(app)
            .delete(`/api/notes/${data.id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(500);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Internal Server Error');
        });
    });

  });

});
