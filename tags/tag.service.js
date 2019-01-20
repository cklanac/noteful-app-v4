// Creates a common interface for database calls

const mongoose = require('mongoose');
const createError = require('http-errors');

const TagModel = require('./tag.model');
const { NoteModel } = require('../notes');

exports.findAll = (userId) => {

  return TagModel.find({ userId });
};

exports.findOne = (tagId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(tagId)) {
    const err = createError(400, "Field 'id' must be a Mongo ObjectId");
    return Promise.reject(err);
  }
  return TagModel.findOne({ _id: tagId, userId });
};

exports.insert = (tag, userId) => {
  if (!tag.name) {
    const err = createError(400, "Field 'name' is required");
    return Promise.reject(err);
  }
  tag.userId = userId;
  return TagModel.create(tag);
};

exports.modify = (tagId, userId, tag) => {
  if (!mongoose.Types.ObjectId.isValid(tagId)) {
    const err = createError(400, "Field 'id' must be a Mongo ObjectId");
    return Promise.reject(err);
  }
  if (!tag.name) {
    const err = createError(400, "Field 'name' is required");
    return Promise.reject(err);
  }
  return TagModel.findOneAndUpdate({ _id: tagId, userId: userId }, tag, { new: true });
};

exports.remove = (tagId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(tagId)) {
    const err = createError(400, "Field 'id' must be a Mongo ObjectId");
    return Promise.reject(err);
  }
  const tagRemovePromise = TagModel.deleteOne({ _id: tagId, userId });
  const noteRemovePromise = NoteModel.updateMany(
    { tags: tagId, userId },
    { $unset: { tags: '' } }
  );
  return Promise.all([tagRemovePromise, noteRemovePromise]);
};
