/**
 * Created by bqxu on 15/12/20.
 */
var tools = require("../../tools");
var cookieParser = require('cookie-parser');
module.exports = function (option) {
  return cookieParser();
};
