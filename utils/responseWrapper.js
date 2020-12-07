/**
 * Created by Manthan on 07/11/2020.
 * To manage the structure of the response
 */
const messages = require('../static/statusMessages');

let error_pointer = 'codes';
function successResponse(code, res, responseObj, message) {
  let response = {};
  response.code = code;
  response.result = responseObj;
  if (code !== 200) {
    response.message = messages[error_pointer][code];
  } else {
    response.message = message;
  }
  res.status(200).send(response);
}

function internalServerResponse(error, res) {
  res.status(500).send({ error: error.message });
}

function failedResponse(err, res) {
  const errorCodes = Object.keys(messages[error_pointer]);
  if (errorCodes.indexOf(err.toString()) !== -1) {
    successResponse(err, res, {});
  } else {
    internalServerResponse(err, res);
  }
}

/// --- Exports
module.exports = {
  successResponse,
  internalServerResponse,
  failedResponse,
};
