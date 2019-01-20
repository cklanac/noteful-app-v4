// Mongoose Model and Schema defines document and creates model

const mongoose = require('mongoose');
const debug = require('debug')('app:models');

debug('create tag schema and model');

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: {
    type: mongoose.ObjectId,
    // get: id => id ? id.toString() : id,
    ref: 'User',
    required: true }
});

tagSchema.set('timestamps', true);
tagSchema.index({ name: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Tag', tagSchema);
