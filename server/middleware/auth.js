'use strict';
var tools = require("../../tools");
var loopback = require("loopback");
module.exports = function (option) {
  option = option || {};
  var ignore = option['ignore'] || [];
  var ignoreAll = option['ignoreAll'];
  return function authMiddleware(req, res, next) {
    if(!loopback.getCurrentContext()){
      loopback.createContext('auth')
    }
    let AuthClient = tools.getModelByName('AuthClient');
    var userInfo = AuthClient.getUser(req);
    tools.saveUser(userInfo);
    if (ignoreAll) {
      next();
    } else if (tools.inArrayMatch(ignore, req.path)) {
      next();
    } else if (!tools.isNotObj(tools.getUser())) {
      next();
    } else {
      AuthClient.cookieLoginInfo(req, function (err, userInfo) {
        if (!err && userInfo) {
          tools.saveUser(userInfo);
          next();
        } else {
          var error = new Error("no login");
          error.status = 401;
          delete error.stack;
          if (req.xhr) {
            next(error);
          } else {
            res.redirect(301, '/#!/login');
            next(error);
          }
        }
      })
    }
  }
};
