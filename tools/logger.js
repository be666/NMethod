/**
 * Created by bqxu on 15/12/12.
 */
var tools = require("./index");

exports.logVisit = function (url) {
  var VisitLog = tools.getModelByName("VisitLog");
  VisitLog.log(url);
};

exports.optionLog = function (action, req) {
  var OptionLog = tools.getModelByName("OptionLog");
  OptionLog.option(action, req);
};

exports.debugger = function () {
  var arg = arguments;
  if (arg.length == 1) {
    arg = arg[0];
  }
  console.log(arg);
};
