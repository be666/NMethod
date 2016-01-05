/**
 * to maintain user status, user information is currently logged in user's userName userRule, userId
 * 1 when landing,
 * access to LDAP, to determine whether the validity
 * user information through LDAP, including user permissions
 * generate token, maintain the same time in the session database.
 * store user information in sessionCache;
 *
 * 2 visits per visit,
 * get token from session
 * database validation of token
 * according to the token to get the corresponding user information
 *
 * 3
 * automatic landing
 *
 */
var tools = require('../../tools');
var sessionCache = {};
var session_user_key = "session_user_token";

exports.login = function (req, uid, pwd, cb) {
  var LoginUser = tools.getModelByName("LoginUser");
  LoginUser.getUserInfo(uid, pwd, function (result) {
    var session = req.session;
    if (result.state == "success") {
      var userInfo = result.userInfo;
      var cUser = null;
      LoginUser.findByLoginName(uid).then(function (user) {
        cUser = user;
        if (tools.isNotObj(cUser)) {
          LoginUser.createByLoginName(uid, userInfo.userName, userInfo.userRule).then(function (user) {
            cUser = user;
            if (cUser != null) {
              userInfo.userId = cUser.id;
              var tokenInfo = tools.getUUid();
              var userToken;
              LoginUser.saveToken(userInfo.userId, tokenInfo).then(function (token) {
                userToken = token;
                session[session_user_key] = userToken.tokenInfo;
                sessionCache[session[session_user_key]] = userInfo;
                cb("success", userInfo, userToken.tokenInfo);
              });
            }
          });
        } else if (cUser != null) {
          userInfo.userId = cUser.id;
          var tokenInfo = tools.getUUid();
          var userToken;
          LoginUser.saveToken(userInfo.userId, tokenInfo).then(function (token) {
            userToken = token;
            session[session_user_key] = userToken.tokenInfo;
            sessionCache[session[session_user_key]] = userInfo;
            cb("success", userInfo, userToken.tokenInfo);
          });
        }
      });
    } else {
      session[session_user_key] = null;
      cb();
    }
  });

};

exports.logOut = function (req, cb) {
  var LoginUser = tools.getModelByName("LoginUser");
  var session = req.session;
  var _session_user_key = session[session_user_key];
  LoginUser.deleteToken(_session_user_key).then(function (info, count) {
    session[_session_user_key] = null;
    sessionCache[_session_user_key] = null;
    cb();
  })
};

exports.checkUser = function (req, cb) {
  var LoginUser = tools.getModelByName("LoginUser");
  var session = req.session;
  var _session_user_key = session[session_user_key];
  if (tools.isNotEmptyStr(_session_user_key)) {
    LoginUser.findByToken(_session_user_key).then(function (userToken) {
      cb(sessionCache[_session_user_key])
    })
  } else {
    cb();
  }
};

exports.getUser = function (req) {
  var session = req.session;
  var _session_user_key = session[session_user_key];
  return sessionCache[_session_user_key];
};


exports.autoLogin = function (req, res, tokenInfo) {
  res.cookie('atk', tokenInfo, {path: '/', maxAge: 7 * 24 * 60 * 60 * 1000});
};

exports.checkAutoLogin = function (req, success, error) {
  var cookies = req.cookies;
  var session = req.session;
  if (cookies['atk']) {
    var _session_user_key = cookies['atk'];
    var LoginUser = tools.getModelByName("LoginUser");
    LoginUser.findByToken(_session_user_key).then(function (userToken) {
      var userId = userToken.userId;
      LoginUser.findUserById(userId).then(function (user) {
        var userInfo = user;
        userInfo.userRule = JSON.parse(user.rule);
        session[session_user_key] = _session_user_key;
        sessionCache[session[session_user_key]] = userInfo;
        success(user);
      }).catch(function () {
        error();
      })
    }).catch(function () {
      error();
    })
  } else {
    error();
  }
}
