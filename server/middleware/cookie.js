'use strict';
var tools = require("../../tools");
var cookieParser = require('cookie-parser');
module.exports = function (option) {
  return cookieParser();
};
