const mongoose = require('mongoose');
const createError = require('http-errors');

const Folder = require('../models/folder.model');
const Note = require('../models/note.model');

exports.findAll = (userId) => {

  return Folder.find({ userId }).sort('name');

};

exports.findOne = (id, userId) => {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = createError(400, "Field 'id' must be a Mongo ObjectId");
    return Promise.reject(err);
  }

  return Folder.findOne({ _id: id, userId });

};

exports.insert = (name, userId) => {

  const folder = { name, userId };
  if (!folder.name) {
    const err = createError(400, "Field 'name' is required");
    return Promise.reject(err);
  }

  return Folder.create(folder);

};

exports.modify = (id, userId, folder) => {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = createError(400, "Field 'id' must be a Mongo ObjectId");
    return Promise.reject(err);
  }

  if (!folder.name) {
    const err = createError(400, "Field 'name' is required");
    return Promise.reject(err);
  }

  return Folder.findOneAndUpdate({ _id: id, userId: userId }, folder, { new: true });

};

exports.remove = (id, userId) => {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = createError(400, "Field 'id' must be a Mongo ObjectId");
    return Promise.reject(err);
  }

  const folderRemovePromise = Folder.findOneAndDelete({ _id: id, userId });

  const noteRemovePromise = Note.updateMany(
    { folderId: id, userId },
    { $unset: { folderId: '' } }
  );

  return Promise.all([folderRemovePromise, noteRemovePromise])
  .then( console.log);

};



exports.insertMany = (folders) => {

  return Folder.insertMany(folders);

};
