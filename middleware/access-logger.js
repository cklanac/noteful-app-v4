// request access logger

const morgan = require('morgan');
const logger = require('../helpers/winston');

const format = process.env.LOG_FORMAT;

/**
 * `write` property points to the `logger.info` method
 *
 *    logger.stream = {
 *      write: (message, encoding) => logger.info(message)
 *    };
 *
 */
logger.stream.write = logger.info;

module.exports = morgan(format, logger);
