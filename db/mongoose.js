const mongoose = require('mongoose');
const debug = require('debug')('app:db');

debug('config db');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// mongoose.ObjectId.get(v => v.toString());

const serialize = {
  virtuals: true,
  versionKey: false,
  transform: (doc, result) => {
    delete result._id;
    delete result.password;
  }
};

mongoose.set('toJSON', serialize);
mongoose.set('toObject', serialize);

module.exports = mongoose;
