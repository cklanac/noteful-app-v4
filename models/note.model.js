const mongoose = require('mongoose');
const debug = require('debug')('app:models');

debug('create note schema and model');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  folderId: {
    type: mongoose.ObjectId,
    get: id => id.toString(),
    ref: 'Folder' },
  tags: [{
    type: mongoose.ObjectId,
    get: id => id.toString(),
    ref: 'Tag'
  }],
  userId: {
    type: mongoose.ObjectId,
    get: id => id.toString(),
    ref: 'User',
    required: true
  }
});

// mongoose.ObjectId.get(v => v.toString());
// mongoose.ObjectId.get(id => {
//   console.log(id);
//   return id ? id.toString() : id;
// });

noteSchema.set('timestamps', true);

module.exports = mongoose.model('Note', noteSchema);
