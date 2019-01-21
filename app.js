// concerned about loading express middleware and mounting express routers (directling the request)

const path = require('path');
const helmet = require('helmet');
const express = require('express');
const favicon = require('serve-favicon');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const debug = require('debug')('app:init');

const { authRouter } = require('./auth');
const { userRouter } = require('./users');
const { folderRouter } = require('./folders');
const { noteRouter } = require('./notes');
const { tagRouter } = require('./tags');

const custom = require('./middleware');

debug('initialize express');
const app = express();
debug('load middleware');

app.use(custom.accessLogger);
app.use(helmet());
app.use(compression());

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(custom.cors);
app.use(express.json());
app.use(cookieParser());

debug('load routes');
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

app.use('/api/folders', folderRouter);
app.use('/api/notes', noteRouter);
app.use('/api/tags', tagRouter);

debug('load error handlers');
app.use(custom.errNotFound);
app.use(custom.errDatabase);
app.use(custom.errOperational);
app.use(custom.errApplication);

module.exports = app; // Export for testing
