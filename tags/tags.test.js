const chai = require('chai');
const sinon = require('sinon');
const express = require('express');
const jwt = require('jsonwebtoken');
const chaiHttp = require('chai-http');

const app = require('../app');
const db = require('../db/mongoose');
const data = require('../db/test-data');

const TagModel = require('./tag.model');
const { NoteModel } = require('../notes');
const { UserModel } = require('../users');

const { TEST_MONGODB_URI, JWT_SECRET } = require('../config');

chai.use(chaiHttp);
const expect = chai.expect;
const sandbox = sinon.createSandbox();

describe('Noteful API - Tags', function () {

  let user;
  let token;
  before(function () {
    return db.connect(TEST_MONGODB_URI)
      .then(() => db.connection.dropDatabase());
  });

  beforeEach(function () {
    return Promise.all([
      UserModel.insertMany(data.users),
      TagModel.insertMany(data.tags),
      NoteModel.insertMany(data.notes),
      TagModel.createIndexes(),
    ])
      .then(([users]) => {
        user = users[0];
        token = jwt.sign({ user }, JWT_SECRET, { subject: user.username });
      });
  });

  afterEach(function () {
    sandbox.restore();
    return Promise.all([
      NoteModel.deleteMany(),
      TagModel.deleteMany(),
      UserModel.deleteMany()
    ]);
  });

  after(function () {
    return db.connection.dropDatabase()
      .then(() => db.disconnect());
  });

  describe('GET /api/tags', function () {

    it('should return the correct number of tags', function () {
      return Promise.all([
        TagModel.find({ userId: user.id }),
        chai.request(app)
          .get('/api/tags')
          .set('Authorization', `Bearer ${token}`)
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should return a list sorted by name with the correct fields and values', function () {
      return Promise.all([
        TagModel.find({ userId: user.id }),
        chai.request(app)
          .get('/api/tags')
          .set('Authorization', `Bearer ${token}`)
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          res.body.forEach(function (item, i) {
            expect(item).to.be.a('object');
            expect(item).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt', 'userId');
            expect(item.id).to.equal(data[i].id);
            expect(item.name).to.equal(data[i].name);
            expect(item.userId).to.equal(data[i].userId.toString());
            expect(new Date(item.createdAt)).to.eql(data[i].createdAt);
            expect(new Date(item.updatedAt)).to.eql(data[i].updatedAt);
          });
        });
    });

    it('should catch errors and respond properly', function () {
      sandbox.stub(db.get('toJSON'), 'transform').throws();

      return chai.request(app)
        .get('/api/tags')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(500);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Internal Server Error');
        });
    });

  });

  describe('GET /api/tags/:id', function () {

    it('should return correct tags', function () {
      let data;
      return TagModel.findOne({ userId: user.id })
        .then(_data => {
          data = _data;
          return chai.request(app)
            .get(`/api/tags/${data.id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt', 'userId');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(res.body.userId).to.equal(data.userId.toString());
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should respond with a 400 for an invalid id', function () {
      return chai.request(app)
        .get('/api/tags/NOT-A-VALID-ID')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal("Field 'id' must be a Mongo ObjectId");
        });
    });

    it('should respond with a 404 for an id that does not exist', function () {

      return chai.request(app)
        .get('/api/tags/DOESNOTEXIST')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should catch errors and respond properly', function () {
      sandbox.stub(db.get('toJSON'), 'transform').throws();

      return TagModel.findOne()
        .then(data => {
          return chai.request(app)
            .get(`/api/tags/${data.id}`)
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

  describe('POST /api/tags', function () {

    it('should create and return a new item when provided valid data', function () {
      const newItem = { name: 'newTag' };
      let body;

      return chai.request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${token}`)
        .send(newItem)
        .then(function (res) {
          body = res.body;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(body).to.be.a('object');
          expect(body).to.have.keys('id', 'name', 'createdAt', 'updatedAt', 'userId');
          return TagModel.findOne({ userId: user.id, _id: body.id });
        })
        .then(data => {
          expect(body.id).to.equal(data.id);
          expect(body.name).to.equal(data.name);
          expect(body.userId).to.equal(data.userId.toString());
          expect(new Date(body.createdAt)).to.eql(data.createdAt);
          expect(new Date(body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should return an error when missing "name" field', function () {
      const newItem = {};
      return chai.request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${token}`)
        .send(newItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal("Field 'name' is required");
        });
    });

    it('should return an error when "name" field is empty string', function () {
      const newItem = { name: '' };
      return chai.request(app)

        .post('/api/tags')
        .set('Authorization', `Bearer ${token}`)
        .send(newItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal("Field 'name' is required");
        });
    });

    it('should return an error when given a duplicate name', function () {
      let data;
      return TagModel.findOne({ userId: user.id })
        .then(_data => {
          data = _data;
          const newItem = { name: data.name };
          return chai.request(app)
            .post('/api/tags')
            .set('Authorization', `Bearer ${token}`)
            .send(newItem);
        })
        .then(res => {
          expect(res).to.have.status(409);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal(`Resource '${data.name}' must be unique`);
        });
    });

    it('should catch errors and respond properly', function () {
      sandbox.stub(db.get('toJSON'), 'transform').throws();

      const newItem = { name: 'newTag' };
      return chai.request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${token}`)
        .send(newItem)
        .then(res => {
          expect(res).to.have.status(500);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Internal Server Error');
        });
    });

  });

  describe('PUT /api/tags/:id', function () {

    it('should update the tag', function () {
      const updateItem = { name: 'Updated Name' };
      let data;
      return TagModel.findOne({ userId: user.id })
        .then(_data => {
          data = _data;
          return chai.request(app)
            .put(`/api/tags/${data.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateItem);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt', 'userId');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(updateItem.name);
          expect(res.body.userId).to.equal(data.userId.toString());
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.greaterThan(data.updatedAt);
        });
    });

    it('should respond with a 400 for an invalid id', function () {
      const updateItem = { name: 'Blah' };

      return chai.request(app)
        .put('/api/tags/NOT-A-VALID-ID')
        .set('Authorization', `Bearer ${token}`)
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal("Field 'id' must be a Mongo ObjectId");
        });
    });

    it('should respond with a 404 for an id that does not exist', function () {
      const updateItem = { name: 'Blah' };
      return chai.request(app)
        .put('/api/tags/DOESNOTEXIST')
        .set('Authorization', `Bearer ${token}`)
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should return an error when missing "name" field', function () {
      const updateItem = {};
      let data;
      return TagModel.findOne({ userId: user.id })
        .then(_data => {
          data = _data;
          return chai.request(app)
            .put(`/api/tags/${data.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateItem);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal("Field 'name' is required");
        });
    });

    it('should return an error when "name" field is empty string', function () {
      const updateItem = { name: '' };
      let data;
      return TagModel.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app)
            .put(`/api/tags/${data.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateItem);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal("Field 'name' is required");
        });
    });

    it('should return an error when given a duplicate name', function () {
      let data;
      return TagModel.find({ userId: user.id }).limit(2)
        .then(_data => {
          data = _data;
          const [item1, item2] = data;
          item1.name = item2.name;
          return chai.request(app)
            .put(`/api/tags/${item1.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(item1);
        })
        .then(res => {
          expect(res).to.have.status(409);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal(`Resource '${data[1].name}' must be unique`);
        });
    });

    it('should catch errors and respond properly', function () {
      sandbox.stub(db.get('toJSON'), 'transform').throws();

      const updateItem = { name: 'Updated Name' };
      return TagModel.findOne()
        .then(data => {
          return chai.request(app)
            .put(`/api/tags/${data.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateItem);
        })
        .then(res => {
          expect(res).to.have.status(500);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Internal Server Error');
        });
    });

  });

  describe('DELETE /api/tags/:id', function () {

    it('should delete an existing tag and respond with 204', function () {
      let data;
      return TagModel.findOne({ userId: user.id })
        .then(_data => {
          data = _data;
          return chai.request(app)
            .delete(`/api/tags/${data.id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(function (res) {
          expect(res).to.have.status(204);
          expect(res.body).to.be.empty;
          return TagModel.countDocuments({ _id: data.id });
        })
        .then(count => {
          expect(count).to.equal(0);
        });
    });

    it('should delete an existing tag and remove tag reference from note', function () {
      let tagId;
      return NoteModel.findOne({ tags: { $exists: true, $ne: [] } })
        .then(data => {
          tagId = data.tags[0];

          return chai.request(app)
            .delete(`/api/tags/${tagId}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(function (res) {
          expect(res).to.have.status(204);
          expect(res.body).to.be.empty;
          return NoteModel.countDocuments({ tags: tagId });
        })
        .then(count => {
          expect(count).to.equal(0);
        });
    });

    it('should respond with a 400 for an invalid id', function () {
      return chai.request(app)
        .delete('/api/tags/NOT-A-VALID-ID')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal("Field 'id' must be a Mongo ObjectId");
        });
    });

    it('should catch errors and respond properly', function () {
      sandbox.stub(express.response, 'sendStatus').throws();

      return TagModel.findOne()
        .then(data => {
          return chai.request(app)
            .delete(`/api/tags/${data.id}`)
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
