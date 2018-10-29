'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// ===== Define UserSchema & UserModel =====
const schema = new mongoose.Schema({
  fullname: { type: String, default: '' },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Transform output during `res.json(data)`, `console.log(data)` etc.
schema.set('toJSON', {
  virtuals: true,
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
    delete result.password;
  }
});

// Note: Use `function` (not an `arrow function`) to allow setting `this`
schema.methods.validatePassword = function (incomingPassword) {
  const user = this;
  return bcrypt.compare(incomingPassword, user.password);
};

schema.statics.hashPassword = function (incomingPassword) {
  return bcrypt.hash(incomingPassword, 10);
};

module.exports = mongoose.model('User', schema);
