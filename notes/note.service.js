const mongoose = require('mongoose');
const createError = require('http-errors');

const Tag = require('../tags/tag.model');
const Note = require('../notes/note.model');
const FolderModel = require('../folders/folder.model');

const validateFolderId = (folderId, userId) => {
  return new Promise((resolve, reject) => {
    const err = createError(400, 'The `folderId` is not valid');
    if (folderId === undefined || folderId === '') {
      return resolve();
    }

    if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
      return reject(err);
    }

    FolderModel.countDocuments({ _id: folderId, userId })
      .then(count => {
        if (count === 0) {
          return reject(err);
        } else {
          resolve();
        }
      });
  });
};

function validateTagIds(tags, userId) {
  return new Promise((resolve, reject) => {
    if (tags === undefined) {
      return resolve();
    }

    if (!Array.isArray(tags)) {
      const err = createError(400, 'The `tags` property must be an array');
      return reject(err);
    }

    const badIds = tags.filter((tag) => !mongoose.Types.ObjectId.isValid(tag));
    if (badIds.length) {
      const err = createError(400, 'The `tags` array contains an invalid `id`');
      return reject(err);
    }

    return Tag.find({ $and: [{ _id: tags, userId }] })
      .then(results => {
        if (tags.length !== results.length) {
          const err = createError(400, 'The `tags` array contains an invalid `id`');
          return reject(err);
        } else {
          resolve(results);
        }
      });
  });
}

exports.findAll = (userId, query = {}) => {
  const { searchTerm, folderId, tagId } = query;

  let filter = { userId };

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.$or = [{ 'title': re }, { 'content': re }];
  }

  if (folderId) {
    filter.folderId = folderId;
  }

  if (tagId) {
    filter.tags = tagId;
  }

  return Note.find(filter)
    .populate('tags')
    .sort({ updatedAt: 'desc' });

};

exports.findOne = (id, userId) => {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = createError(400, "Field 'id' must be a Mongo ObjectId");
    return Promise.reject(err);
  }

  return Note.findOne({ _id: id, userId }).populate('tags');

};

exports.findNoteWithTags = (userId) => {

  return Note.findOne({ userId, tags: { $exists: true, $ne: [] } });

};

exports.countDocuments = (query) => {

  return Note.countDocuments(query);

};

exports.insert = (note, userId) => {

  if (!note.title) {
    const err = createError(400, 'Missing `title` in request body');
    return Promise.reject(err);
  }

  if (note.folderId === '') {
    const err = createError(400, 'Missing `folderId` in request body');
    return Promise.reject(err);
  }

  if (!mongoose.Types.ObjectId.isValid(note.folderId)) {
    const err = createError(400, 'The `folderId` is not valid');
    return Promise.reject(err);
  }

  return Promise.all([
    validateFolderId(note.folderId, userId),
    validateTagIds(note.tags, userId)
  ]).then(() => Note.create(note));

};

exports.modify = (id, userId, note) => {

  if (note.title === '') {
    const err = createError(400, 'Missing `title` in request body');
    return Promise.reject(err);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = createError(400, "Field 'id' must be a Mongo ObjectId");
    return Promise.reject(err);
  }

  if (note.folderId === '') {
    const err = createError(400, 'Missing `folderId` in request body');
    return Promise.reject(err);
  }

  if (note.folderId && !mongoose.Types.ObjectId.isValid(note.folderId)) {
    const err = createError(400, 'The `folderId` is not valid');
    return Promise.reject(err);
  }

  return Promise.all([
    validateFolderId(note.folderId, userId),
    validateTagIds(note.tags, userId)
  ])
    .then(() => {
      return Note
        .findOneAndUpdate({ _id: id, userId }, note, { new: true })
        .populate('tags');
    });

};

exports.remove = (id, userId) => {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = createError(400, "Field 'id' must be a Mongo ObjectId");
    return Promise.reject(err);
  }

  return Note.findOneAndDelete({ _id: id, userId });

};

exports.insertMany = (notes) => {

  return Note.insertMany(notes);

};

exports.removeMany = () => {

  return Note.deleteMany();

};
