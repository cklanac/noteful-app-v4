
/**
 * Bcrypt Demo
 * - Use Bcrypt to hash and compare password
 */

const bcrypt = require("bcryptjs");

/** Bcrypt using promises */
const pwd = "baseball";

bcrypt.hash(pwd, 10)
  .then(hash => {
    console.log("Hashed Password:", pwd, hash);
    return hash;
  });

bcrypt.compare(pwd, "$2a$10$1IY7WTWzL4aRhE0LrOEpduBWDJ6FtN6WHcfSejSPc05De3o4Pi96u")
  .then(valid => {
    console.log(valid);
  });

/*
bcrypt.hash('baseball', 12)
  .then(hash => {
    console.log('hash:', hash);
    return hash;
  })
  .then(hash => {
    return bcrypt.compare('baseball', hash);
  })
  .then(valid => {
    console.log(valid);
  })
  .catch(err => {
    console.error('error', err);
  });
 */
