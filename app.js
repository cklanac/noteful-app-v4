const path = require('path');
const helmet = require('helmet');
const express = require('express');
const favicon = require('serve-favicon');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const debug = require('debug')('app:init');

const routes = require('./routes');
const { cors, logger, notFound, errorHandler } = require('./middleware');

debug('initialize express');
const app = express();

debug('load middleware');
app.use(logger);
app.use(helmet());
app.use(compression());

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
app.use(notFound);
app.use(errorHandler);

module.exports = app; // Export for testing
