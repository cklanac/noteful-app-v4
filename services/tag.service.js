const mongoose = require('mongoose');
const createError = require('http-errors');

const { Tag, Note } = require('../models');

exports.findAll = (userId) => {

  return Tag.find({ userId });
};

exports.findOne = (tagId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(tagId)) {
    const err = createError(400, "Field 'id' must be a Mongo ObjectId");
    return Promise.reject(err);
  }
  return Tag.findOne({ _id: tagId, userId });
};

exports.insert = (tag, userId) => {
  if (!tag.name) {
    const err = createError(400, "Field 'name' is required");
    return Promise.reject(err);
  }
  tag.userId = userId;
  return Tag.create(tag);
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
  return Tag.findOneAndUpdate({ _id: tagId, userId: userId }, tag, { new: true });
};

exports.remove = (tagId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(tagId)) {
    const err = createError(400, "Field 'id' must be a Mongo ObjectId");
    return Promise.reject(err);
  }
  const tagRemovePromise = Tag.findOneAndDelete({ _id: tagId, userId });
  const noteRemovePromise = Note.updateMany(
    { tags: tagId, userId },
    { $unset: { tags: '' } }
  );
  return Promise.all([tagRemovePromise, noteRemovePromise]);
};
