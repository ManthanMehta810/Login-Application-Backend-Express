/* eslint-disable no-console */
/**
 * Created by Manthan Mehta
 * Initial structure
 */

// REQUIRES
const express = require('express');
const routeResources = require('node-resources');
const bodyParser = require('body-parser');
const cors = require('cors');
const dbConfig = require('./config/database.config.js');
global.config = require('./config/config');
// application config
const envConfig = require('./config/env.config');
const logging = require('./logging');

// GLOBAL CONFIG
global.jwt = require('jsonwebtoken');
global.ejwt = require('express-jwt');
// Configuring the database
global.mongoose = require('mongoose');
global.async = require('async');
global.responseWrapper = require('./utils/responseWrapper');
global.validationWrapper = require('./utils/validationWrapper');
global.encryptionWrapper = require('./utils/encryptionWrapper');
// require static files
global.Constant = require('./static/constants');
console.log(new Date());
// create express app
const app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// Enable cors
app.use(cors());
// parse requests of content-type - application/json
app.use(bodyParser.json());

// Require Notes routes
routeResources.registerRoutes(app, {
  path: `${__dirname}/resources/`,
  pattern: '[folder].routes.js',
});
app.use((req, res, next) => {
  res.status(405).send({
    status: 405,
    error: 'Method not allowed',
  });
  next();
});
// Register Logger
global.logger = logging.createLogger();
// listen for requests
app.listen(envConfig[envConfig.current_env].port, () => {
  global.logger.info(
    `Server is listening on port ${envConfig[envConfig.current_env].port}`,
  );
  console.log(
    `Server is listening on port ${envConfig[envConfig.current_env].port}`,
  );
});

mongoose.Promise = global.Promise;

// Connecting to the database
mongoose
  .connect(dbConfig[envConfig.current_env], {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    global.logger.info('Successfully connected to the database');
    console.log('Successfully connected to the database');
  })
  .catch((err) => {
    global.logger.info(
      `Could not connect to the database. Exiting now... 
      ${err}`,
    );
    console.log(
      `Could not connect to the database. Exiting now... 
      ${err}`,
    );
    process.exit();
  });
