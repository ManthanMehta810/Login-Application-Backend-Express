/**
 * Created by Manthan Mehta
 * Encrypt password
 */
const bcrypt = require('bcrypt');

const saltRounds = 10;
const encrypt = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });
};

const compare = (password, dbPassword) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, dbPassword, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
module.exports = {
  encrypt,
  compare,
};
