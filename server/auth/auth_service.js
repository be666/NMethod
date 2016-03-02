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
var url = require('url');
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
        if (cUser == null) {
          console.log(111);
          LoginUser.createByLoginName(uid, userInfo.userName, userInfo.userRule).then(function (user) {
            cUser = user;
            if (cUser != null) {
              userInfo.userId = cUser.id;
              var tokenInfo = tools.getUUid();
              var userToken;
              LoginUser.saveToken(userInfo.userId, tokenInfo, req.ip).then(function (token) {
                userToken = token;
                session[session_user_key] = userToken.tokenInfo;
                sessionCache[session[session_user_key]] = userInfo;
                cb("success", userInfo, userToken.tokenInfo);
              });
            }
          });
        } else {
          console.log(22);
          userInfo.userId = cUser.id;
          var tokenInfo = tools.getUUid();
          var userToken;
          console.log(33);
          LoginUser.saveToken(userInfo.userId, tokenInfo, req.ip).then(function (token) {
            console.log('111');
            console.log(token);
            userToken = token;
            session[session_user_key] = userToken.tokenInfo;
            sessionCache[session[session_user_key]] = userInfo;
            cb("success", userInfo, userToken.tokenInfo);
          }).catch(function (err) {
            console.log(err);
            console.log(44);
          })
        }
      }).catch(function (err) {
        console.log(err);
      })
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
  var refer = req.get('Referrer');
  var urlObj = new url.parse(refer);
  res.cookie('atk', tokenInfo, {domain: urlObj.host, path: '/', maxAge: 7 * 24 * 60 * 60 * 1000});
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
        session[session_user_key] = _session_user_key;
        sessionCache[session[session_user_key]] = userInfo;
        success(user);
      }).catch(function (err) {
        error();
      })
    }).catch(function () {
      error();
    })
  } else {
    error();
  }
}
