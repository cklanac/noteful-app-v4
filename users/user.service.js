const bcrypt = require('bcryptjs');
const User = require('../users/user.model');

exports.insert = (user) => {

  return bcrypt.hash(user.password, 10)
    .then(digest => {
      user.password = digest;
      return User.create(user);
    });

};

exports.findOneByUsername = (username) => {

  return User.findOne({ username });

};

exports.insertMany = (users) => {

  return User.insertMany(users);

};

exports.removeMany = () => {

  return User.deleteMany();

};
