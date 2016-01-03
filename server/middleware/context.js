/**
 * Created by bqxu on 15/12/17.
 */
var tools = require("../../tools");
var async = require('async');
module.exports = function (option) {
  //return tools.loopback.context(option);
  var loopback = tools.loopback;
  var contextHandler = tools.loopback.context({
    enableHttpContext: true
  });
  var initHttp = function (req, res, next) {
    next();
  };
  return function contextMiddleware(req, res, next) {
    async.eachSeries([contextHandler, initHttp], function (handler, done) {
      handler(req, res, done);
    }, next);
  };
};
