const mongoose = require('mongoose');
const debug = require('debug')('app:models');

debug('create note schema and model');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  folderId: {
    type: mongoose.ObjectId,
    // get: id => id ? id.toString() : id,
    ref: 'Folder'
  },
  tags: [{
    type: mongoose.ObjectId,
    ref: 'Tag'
  }],
  userId: {
    type: mongoose.ObjectId,
    // get: id => id ? id.toString() : id,
    ref: 'User',
    required: true
  }
});

noteSchema.set('timestamps', true);

module.exports = mongoose.model('Note', noteSchema);
