const mongoose = require('mongoose');
const debug = require('debug')('app:models');

debug('create folder schema and model');

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: {
    type: mongoose.ObjectId,
    // get: id => id ? id.toString() : id,
    ref: 'User',
    required: true }
});

folderSchema.set('timestamps', true);
folderSchema.index({ name: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Folder', folderSchema);
