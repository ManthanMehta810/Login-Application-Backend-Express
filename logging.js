const fs = require('fs');
const path = require('path');
const bunyan = require('bunyan');
const envConfig = require('./config/env.config');

/*
 * configure and start logging
 * return the created logger instance
 */
function createLogger() {
  const pkg = require(path.join(__dirname, 'package'));
  const appName = pkg.name;
  const appVersion = pkg.version;
  const logDir = path.join(__dirname, 'logs');
  const logFile = path.join(logDir, `${appName}-log.json`);
  const logErrorFile = path.join(logDir, `${appName}-errors.json`);
  const logLevel = 'debug';

  // Create log directory if it doesnt exist
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

  // Log to console and log file
  const log = bunyan.createLogger({
    name: appName,
    streams: [
      {
        stream: process.stdout,
        level: 'warn',
      },
      {
        path: logFile,
        level: logLevel,
        type: 'rotating-file',
        period: '1d',
        count: 3,
      },
      {
        path: logErrorFile,
        level: 'error',
        type: 'rotating-file',
        period: '1d',
        count: 3,
      },
    ],
    serializers: bunyan.stdSerializers,
  });

  log.info(`Starting ${appName}, version ${appVersion}`);
  log.info(`Environment set to ${envConfig.current_env}`);
  log.debug('Logging setup completed.');

  return log;
}
exports.createLogger = createLogger;
