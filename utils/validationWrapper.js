/**
 * Created by Manthan Mehta
 * Validation logic for the request
 */

// Validate Phone Number

const phoneNumberValidation = (phoneNumber) => {
  const regex = /^\+{0,2}([\-\. ])?(\(?\d{0,3}\))?([\-\. ])?\(?\d{0,3}\)?([\-\. ])?\d{3}([\-\. ])?\d{4}/;
  return regex.test(phoneNumber);
};

// Validate sign up request
const signUpValidation = (req) => {
  if (req.body) {
    if (
      req.body.firstName &&
      req.body.lastName &&
      req.body.phoneNumber &&
      req.body.address &&
      req.body.dOB &&
      req.body.profilePhoto &&
      req.body.password
    ) {
      if (phoneNumberValidation(req.body.phoneNumber)) {
        return true;
      }
      return false;
    }
    return false;
  }
  return false;
};

// Vaildate Login request
const loginVaildation = (req) => {
  if (req.body) {
    if (req.body.phoneNumber && req.body.password) {
      if (phoneNumberValidation(req.body.phoneNumber)) {
        return true;
      }
      return false;
    }
  }
  return false;
};

// Vaildate CheckStatus request
const checkStatusVaildation = (req) => {
  if (req.body) {
    if (req.body.phoneNumber) {
      if (phoneNumberValidation(req.body.phoneNumber)) {
        return true;
      }
      return false;
    }
    return false;
  }
  return false;
};
// Vaildate userId

const userIdValidation = (req) => {
  if (req.body) {
    if (req.body.userId) {
      return true;
    }
    return false;
  }
  return false;
};
// Validate sign up request
const updateUserDataValidation = (req) => {
  if (req.body) {
    if (
      req.body.firstName &&
      req.body.lastName &&
      req.body.address &&
      req.body.dOB &&
      req.body.profilePhoto &&
      req.body.userId
    ) {
      return true;
    }
    return false;
  }
  return false;
};
const uploadToS3 = (fields, files) => {
  if (fields.phoneNumber && files.profilePhoto) {
    if (phoneNumberValidation(fields.phoneNumber[0])) {
      return true;
    }
    return false;
  }
  return false;
};
module.exports = {
  signUpValidation,
  loginVaildation,
  checkStatusVaildation,
  userIdValidation,
  updateUserDataValidation,
  uploadToS3,
};
