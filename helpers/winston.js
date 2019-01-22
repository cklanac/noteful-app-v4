const appRoot = require('app-root-path');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  levels: winston.config.syslog.levels,
  exitOnError: false,
  transports: [
    new winston.transports.File({ filename: `${appRoot}/logs/error.log`, level: 'error' }),   // `error` and below
    new winston.transports.File({ filename: `${appRoot}/logs/combined.log`, level: 'info' }) // `info` and below
  ]
});

module.exports = logger;
