require('dotenv').config();
module.exports = {
  PORT: process.env.PORT,
  LOG_FORMAT: process.env.LOG_FORMAT,
  MONGODB_URI: process.env.MONGODB_URI,
  TEST_MONGODB_URI: process.env.TEST_MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY
};
