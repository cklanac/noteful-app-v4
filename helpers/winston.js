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

// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV === 'development') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
