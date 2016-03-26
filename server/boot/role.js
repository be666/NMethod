'use strict';
var tools = require("../../tools");
module.exports = function (app) {
  var Role = app.models.Role;

  function reject(cb) {
    process.nextTick(function () {
      cb(null, false);
    });
  }

  function checkUserRule(rule) {
    var userInfo = tools.getUserInfo() || {};
    return !!tools.inArray(userInfo.userRule, rule)
  }

  Role.registerResolver('developer', function (role, context, cb) {
    if (!checkUserRule("developer")) {
      reject(cb);
    } else {
      cb(null, true);
    }
  });

};
