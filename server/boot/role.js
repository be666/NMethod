/**
 * 权限控制
 * 根据角色
 */
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

  function checkUserPermissions(modelName) {

  }

  Role.registerResolver('developer', function (role, context, cb) {
    if (!checkUserRule("developer")) {
      reject(cb);
    } else {
      cb(null, true);
    }
  });

};
