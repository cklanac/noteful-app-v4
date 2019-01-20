const chai = require('chai');
// const sinon = require('sinon');
// const express = require('express');
const jwt = require('jsonwebtoken');
const chaiHttp = require('chai-http');

const app = require('../app');
const db = require('../db/mongoose');

const { UserModel } = require('../users');
const { TEST_MONGODB_URI, JWT_SECRET } = require('../config');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Noteful API - Login', function () {

  let token;
  const fullname = 'Test User';
  const username = 'testuser';
  const password = 'testpass';

  before(function () {
    return db.connect(TEST_MONGODB_URI)
      .then(() => db.connection.dropDatabase());
  });

  beforeEach(function () {
    return UserModel.hashPassword(password)
      .then(digest => UserModel.create({
        fullname,
        username,
        password: digest
      }));
  });

  afterEach(function () {
    return UserModel.deleteMany();
  });

  after(function () {
    return db.connection.dropDatabase()
      .then(() => db.disconnect());
  });

  describe('Noteful /api/auth/login', function () {
    it('Should return a valid auth token', function () {
      return chai.request(app)
        .post('/api/auth/login')
        .send({ username, password })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');

          const payload = jwt.verify(res.body.token, JWT_SECRET);

          expect(payload.user).to.not.have.property('password');
          expect(payload.user.fullname).to.equal(fullname);
          expect(payload.user.username).to.equal(username);
        });
    });

    it('Should reject requests without credentials', function () {
      return chai.request(app)
        .post('/api/auth/login')
        .send({})
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body).to.be.an('object');
          expect(res.body.message).to.equal('Bad Request');
        });
    });

    it('Should reject requests with empty string username', function () {
      return chai.request(app)
        .post('/api/auth/login')
        .send({ username: '', password })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body).to.be.an('object');
          expect(res.body.message).to.equal('Bad Request');
        });
    });

    it('Should reject requests with empty string password', function () {
      return chai.request(app)
        .post('/api/auth/login')
        .send({ username, password: '' })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body).to.be.an('object');
          expect(res.body.message).to.equal('Bad Request');
        });
    });

    it('Should reject requests with incorrect username', function () {
      return chai.request(app)
        .post('/api/auth/login')
        .send({ username: 'wrongUsername', password: 'password' })
        .then(res => {
          expect(res).to.have.status(401);
          expect(res.body).to.be.an('object');
          expect(res.body.message).to.equal('Invalid credentials');
        });
    });
  });

  describe('/api/auth/refresh', function () {

    it('should reject requests with no credentials', function () {
      return chai.request(app)
        .post('/api/auth/refresh')
        .then(res => {
          expect(res).to.have.status(401);
        });
    });

    it('should reject requests with an invalid token', function () {
      token = jwt.sign({ username, password, fullname }, 'Incorrect Secret');
      return chai.request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(401);
        });
    });

    it('should reject requests with an expired token', function () {
      token = jwt.sign({ username, password, fullname }, JWT_SECRET, { subject: username, expiresIn: -10 });
      return chai.request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(401);
        });
    });

    it('should return a valid auth token with a newer expiry date', function () {
      const user = { username, fullname };
      const token = jwt.sign({ user }, JWT_SECRET, { subject: username, expiresIn: '1m' });
      const decoded = jwt.decode(token);

      return chai.request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.been.a('object');
          const token = res.body.token;
          expect(token).to.be.a('string');

          const payload = jwt.verify(token, JWT_SECRET);
          expect(payload.user).to.deep.equal({ username, fullname });
          expect(payload.exp).to.be.greaterThan(decoded.exp);
        });
    });
  });

});
