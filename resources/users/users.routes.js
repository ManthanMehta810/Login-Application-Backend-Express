/**
 * Created by Manthan Mehta
 * Export routes for user releated queries
 */
const UserCtrl = require('./controller/userCtrl');

module.exports = function (app) {
  app.post('/v1/signUp', UserCtrl.signUp);
  app.post('/v1/login', UserCtrl.login);
  app.post('/v1/getStatus', UserCtrl.getStatus);
  app.post(
    '/v1/getUserData',
    // middleware for route protection
    ejwt({ secret: config.JWTSceret, algorithms: ['HS256'] }),
    UserCtrl.getUserData,
  );
  app.post(
    '/v1/updateUser',
    // middleware for route protection
    ejwt({ secret: config.JWTSceret, algorithms: ['HS256'] }),
    UserCtrl.updateUser,
  );
  app.post(
    '/v1/uploadImageToS3',
    // middleware for route protection
    // ejwt({ secret: config.JWTSceret, algorithms: ['HS256'] }),
    UserCtrl.uploadImageToS3,
  );
};
