const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const debug = require('debug')('app:init');


const { cors, logger, notFoundRouter, serverErrorRouter } = require('./middleware');

const routes = require('./routes');

debug('initialize express');
const app = express();

debug('load middleware');
app.use(compression());
app.use(logger);
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors);
app.use(express.json());
app.use(cookieParser());

debug('load routes');
app.use('/api/users', routes.users);
app.use('/api/auth', routes.auth);
app.use('/api/notes', routes.notes);
app.use('/api/folders', routes.folders);
app.use('/api/tags', routes.tags);

debug('load error handlers');
app.use((req, res, next) => {
  const err = createError(404, 'Not Found');
  next(err);
});

app.use((err, req, res, next) => {
  // if (err instanceof createError.HttpError) {
  if (err.status) {
    const errBody = Object.assign({}, err, { message: err.message });
    res.status(err.status).json(errBody);
  } else {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = app; // Export for testing
