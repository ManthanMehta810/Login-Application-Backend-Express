/**
 * Created by Manthan Mehta
 * Bussniness logic for the user controller
 */
// require user model
const AWS = require('aws-sdk');
const fs = require('fs');
const fileType = require('file-type');
const bluebird = require('bluebird');
const multiparty = require('multiparty');
const userModel = require('../model/user');
const validationWrapper = require('../../../utils/validationWrapper');

AWS.config.update({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
  region: 'ap-south-1',
});
AWS.config.setPromisesDependency(bluebird);
const s3 = new AWS.S3();
const uploadFile = (buffer, name, type) => {
  const params = {
    ACL: 'public-read',
    Body: buffer,
    Bucket: 'makestories',
    ContentType: type.mime,
    Key: `${name}.${type.ext}`,
  };
  return s3.upload(params).promise();
};
function UserCtrl() {
  // Function to sign up a user to the platform
  this.signUp = function (req, res, next) {
    try {
      async.waterfall(
        [
          function validation(callback) {
            if (validationWrapper.signUpValidation(req)) {
              callback();
            } else {
              callback(603);
            }
          },
          async function checkIfUserExists(callback) {
            try {
              const query = {
                phoneNumber: req.body.phoneNumber,
                isRegistered: true,
              };
              const result = await userModel.findOne(query).lean();
              if (!result) {
                callback();
              } else {
                logger.info(
                  { phoneNumber: req.body.phoneNumber },
                  'UserCtrl.signUp.checkIfUserExists: User is already registered',
                );
                callback(707, null);
              }
            } catch (error) {
              logger.error(
                { error: error.message },
                'UserCtrl.signUp.checkIfUserExists: Error caught in this method',
              );
              callback(error);
            }
          },
          async function saveUserToDatabase(callback) {
            try {
              const date = new Date();
              const password = await encryptionWrapper.encrypt(
                req.body.password,
              );
              const query = {
                phoneNumber: req.body.phoneNumber,
                isRegistered: false,
              };
              const update = {
                userId: `U${date.getTime()}`,
                password,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                phoneNumber: req.body.phoneNumber,
                address: req.body.address,
                dOB: new Date(req.body.dOB),
                profilePhoto: req.body.profilePhoto,
                isRegistered: true,
              };
              const options = {
                new: true,
                fields: {
                  userId: 1,
                  isRegistered: 1,
                },
              };
              const result = await userModel
                .findOneAndUpdate(query, update, options)
                .lean();
              if (!result) {
                logger.info(
                  { phoneNumber: req.body.phoneNumber },
                  'UserCtrl.signUp.saveUserToDatabase: User was not able to register himself',
                );
                callback(702);
              } else {
                const token = jwt.sign(result, config.JWTSceret, {
                  expiresIn: config.tokenExpiry,
                });
                result.token = token;
                logger.info(
                  { phoneNumber: req.body.phoneNumber },
                  'UserCtrl.signUp.saveUserToDatabase: User was able to register himself',
                );
                callback(null, result);
              }
            } catch (error) {
              logger.error(
                { error: error.message },
                'UserCtrl.signUp.saveUserToDatabase: Error caught in this method',
              );
              callback(error);
            }
          },
        ],
        (error, result) => {
          if (error) {
            responseWrapper.failedResponse(error, res);
          } else {
            responseWrapper.successResponse(
              200,
              res,
              result,
              'Registered Succesfully',
            );
          }
        },
      );
    } catch (error) {
      logger.error(
        { error: error.message },
        'UserCtrl.signUp. Error caught in this method',
      );
      responseWrapper.failedResponse(error, res);
    }
  };

  // Function get user logged in
  this.login = function (req, res, next) {
    try {
      async.waterfall(
        [
          function validation(callback) {
            if (validationWrapper.loginVaildation(req)) {
              callback();
            } else {
              callback(603);
            }
          },
          async function checkUser(callback) {
            try {
              const query = {
                phoneNumber: req.body.phoneNumber,
                isRegistered: true,
              };
              const result = await userModel.findOne(query).lean();
              if (!result) {
                callback(706);
              } else {
                callback(null, result);
              }
            } catch (error) {
              logger.error(
                { error: error.message },
                'UserCtrl.login.checkUser: Error caught in this method',
              );
              callback(error);
            }
          },
          async function checkPassword(result, callback) {
            try {
              const match = await encryptionWrapper.compare(
                req.body.password,
                result.password,
              );
              if (!match) {
                logger.info(
                  { userId: result.userId },
                  'UserCtrl.login.checkPassword: User credential not matched',
                );
                callback(705);
              } else {
                let response = {
                  userId: result.userId,
                  isRegistered: result.isRegistered,
                };
                const token = jwt.sign(response, config.JWTSceret, {
                  expiresIn: config.tokenExpiry,
                });
                response.token = token;
                logger.info(
                  { userId: result.userId },
                  'UserCtrl.login.checkPassword: User loggedIn',
                );
                callback(null, response);
              }
            } catch (error) {
              logger.error(
                { error: error.message },
                'UserCtrl.login.checkPassword: Error caught in this method',
              );
              callback(error);
            }
          },
        ],
        (error, result) => {
          if (error) {
            responseWrapper.failedResponse(error, res);
          } else {
            responseWrapper.successResponse(
              200,
              res,
              result,
              'Logged in Succesfully',
            );
          }
        },
      );
    } catch (error) {
      logger.error(
        { error: error.message },
        'UserCtrl.login. Error caught in this method',
      );
      responseWrapper.failedResponse(error, res);
    }
  };

  // Function get user Status
  this.getStatus = function (req, res, next) {
    try {
      async.waterfall(
        [
          function vaildation(callback) {
            if (validationWrapper.checkStatusVaildation(req)) {
              callback();
            } else {
              callback(603);
            }
          },
          async function getUserStatus(callback) {
            try {
              const query = {
                phoneNumber: req.body.phoneNumber,
              };
              const result = await userModel
                .findOne(query, { phoneNumber: 1, isRegistered: 1 })
                .lean();
              callback(null, result);
            } catch (error) {
              logger.error(
                { error: error.message },
                'UserCtrl.getStatus.getUserStatus: Error caught in this method',
              );
              callback(error);
            }
          },
          async function addUserToDatabase(data, callback) {
            try {
              if (!data) {
                const user = new userModel({
                  phoneNumber: req.body.phoneNumber,
                  isRegistered: false,
                });
                const reponse = await user.save();
                callback(null, reponse);
              } else {
                callback(null, data);
              }
            } catch (error) {
              logger.error(
                { error: error.message },
                'UserCtrl.getStatus.addUserToDatabase: Error caught in this method',
              );
              callback(error);
            }
          },
        ],
        (error, result) => {
          if (error) {
            responseWrapper.failedResponse(error, res);
          } else {
            responseWrapper.successResponse(
              200,
              res,
              result,
              'User Status found Succesfully',
            );
          }
        },
      );
    } catch (error) {
      logger.error(
        { error: error.message },
        'UserCtrl.getStatus: Error caught in this method',
      );
      responseWrapper.failedResponse(error, res);
    }
  };

  // Function get user Data
  this.getUserData = function (req, res, next) {
    try {
      async.waterfall(
        [
          function validation(callback) {
            if (validationWrapper.userIdValidation(req)) {
              callback();
            } else {
              callback(603);
            }
          },
          async function getUser(callback) {
            try {
              const query = {
                userId: req.body.userId,
              };
              const result = await userModel
                .findOne(query, {
                  userId: 1,
                  firstName: 1,
                  lastName: 1,
                  phoneNumber: 1,
                  dOB: 1,
                  address: 1,
                  profilePhoto: 1,
                })
                .lean();
              if (!result) {
                callback(500);
              } else {
                callback(null, result);
              }
            } catch (error) {
              logger.error(
                { error: error.message },
                'UserCtrl.getUserData.getUser: Error caught in this method',
              );
              callback(error);
            }
          },
        ],
        (error, result) => {
          if (error) {
            responseWrapper.failedResponse(error, res);
          } else {
            logger.info(
              { userId: result.userId },
              'UserCtrl.getUserData: User Found Succesfully',
            );
            responseWrapper.successResponse(
              200,
              res,
              result,
              'User data found Succesfully',
            );
          }
        },
      );
    } catch (error) {
      logger.error(
        { error: error.message },
        'UserCtrl.getUserData: Error caught in this method',
      );
      responseWrapper.failedResponse(error, res);
    }
  };

  // Function to update user data
  this.updateUser = function (req, res, next) {
    try {
      async.waterfall(
        [
          function vaildation(callback) {
            if (validationWrapper.updateUserDataValidation(req)) {
              callback();
            } else {
              callback(603);
            }
          },
          async function updateUserData(callback) {
            try {
              const query = {
                userId: req.body.userId,
              };
              const update = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                address: req.body.address,
                dOB: req.body.dOB,
                profilePhoto: req.body.profilePhoto,
              };
              const options = {
                new: true,
                fields: {
                  firstName: 1,
                  lastName: 1,
                  address: 1,
                  dOB: 1,
                  profilePhoto: 1,
                  phoneNumber: 1,
                  userId: 1,
                },
              };
              const result = await userModel
                .findOneAndUpdate(query, update, options)
                .lean();
              if (!result) {
                callback(500);
              } else {
                callback(null, result);
              }
            } catch (error) {
              logger.error(
                { error: error.message },
                'UserCtrl.updateUser.updateUserData: Error caught in this method',
              );
              callback(error);
            }
          },
        ],
        (error, result) => {
          if (error) {
            responseWrapper.failedResponse(error, res);
          } else {
            logger.info(
              { userId: result.userId },
              'UserCtrl.updateUser: User not updated',
            );
            responseWrapper.successResponse(
              200,
              res,
              result,
              'Profile Updated Succesfully',
            );
          }
        },
      );
    } catch (error) {
      logger.error(
        { error: error.message },
        'UserCtrl.updateUser: Error caught in this method',
      );
      responseWrapper.failedResponse(error, res);
    }
  };

  // Functionn to upload image to s3
  this.uploadImageToS3 = function (req, res, next) {
    const form = new multiparty.Form();
    form.parse(req, async (error, fields, files) => {
      if (error) {
        logger.error(
          { error: error.message },
          'UserCtrl.uploadImageToS3: Error caught while parsing form',
        );
        responseWrapper.failedResponse(error, res);
      } else {
        async.waterfall(
          [
            function vaildation(callback) {
              if (validationWrapper.uploadToS3(fields, files)) {
                callback();
              } else {
                callback(603);
              }
            },
            async function upload(callback) {
              try {
                if (files.profilePhoto[0].path) {
                  const buffer = fs.readFileSync(files.profilePhoto[0].path);
                  const type = await fileType.fromBuffer(buffer);
                  const fileName = `${fields.phoneNumber[0]}-profilePhoto`;
                  const data = await uploadFile(buffer, fileName, type);
                  const response = {
                    phoneNumber: fields.phoneNumber[0],
                    url: data.Location,
                  };
                  callback(null, response);
                }
              } catch (err) {
                logger.error(
                  { error: err.message },
                  'UserCtrl.uploadImageToS3.upload: Error caught in this method',
                );
                callback(err);
              }
            },
          ],
          (err, result) => {
            if (err) {
              responseWrapper.failedResponse(err, res);
            } else {
              logger.info(
                { phoneNumber: fields.phoneNumber[0] },
                'UserCtrl.updateUser: Profile Photo uploaded successfully',
              );
              responseWrapper.successResponse(
                200,
                res,
                result,
                'Profile Photo uploaded successfully',
              );
            }
          },
        );
      }
    });
  };
}

module.exports = new UserCtrl();
