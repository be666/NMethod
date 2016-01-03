var authService = require("../auth/auth_service");
var tools = require("../../tools");
module.exports = function (User) {

  User.login = function (req, res, userName, password, autoLogin, cb) {
    authService.login(req, userName, password, function (state, userInfo, tokenInfo) {
      if (state == "success") {
        if (autoLogin) {
          authService.autoLogin(req, res, tokenInfo);
        }
        cb(null, userInfo);
      } else {
        var error = new Error("login error");
        error.status = 404;
        cb(error, "false");
      }
    });
  };

  User.remoteMethod("login", {
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}},
      {arg: 'username', type: 'string', required: true},
      {arg: 'password', type: 'string', required: true},
      {arg: 'autoLogin', type: 'boolean'}
    ],
    returns: {arg: 'userInfo', type: 'string'},
    http: {path: "/login", verb: "post"}
  });

  User.logout = function (req, cb) {
    authService.logOut(req, function () {
      authService.checkUser(req, function (loginUser) {
        if (tools.isNotObj(loginUser)) {
          cb(null, "success");
        } else {
          cb(null, "false");
        }
      });
    })
  };

  User.remoteMethod("logout", {
    accepts: {arg: 'req', type: 'object', 'http': {source: 'req'}},
    returns: {arg: 'state', type: 'string'},
    http: {path: "/logout", verb: "post"}
  });

  User.info = function (req, cb) {
    var userInfo = authService.getUser(req);
    if (userInfo) {
      cb(null, userInfo);
    } else {
      authService.checkAutoLogin(req, function (userInfo) {
        cb(null, userInfo);
      }, function () {
        cb(null, null);
      })
    }
  };

  User.remoteMethod("info", {
    accepts: {arg: 'req', type: 'object', 'http': {source: 'req'}},
    returns: {arg: 'userInfo', type: 'object'},
    http: {path: "/info", verb: "post"}
  })

};
