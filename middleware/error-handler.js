function isMongoUniqueError(err) {
  return err
      && (err.name === 'BulkWriteError' || err.name === 'MongoError')
      && (err.code === 11000 || err.code === 11001);
}

module.exports = (err, req, res, next) => {
  if (isMongoUniqueError(err)) {
    res.status(409).json({ message: 'Resource must be unique' });
    return;
  }

  if (err.status) {
    const errBody = Object.assign({}, err, { message: err.message });
    res.status(err.status).json(errBody);
    return;
  }

  res.status(500).json({ message: 'Internal Server Error' });

};
