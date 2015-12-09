/**
 * 保持用户状态,用户信息  当前登陆用户的 userId userName ,userRule
 * 1.登陆时,
 * 访问 ldap ,判断是否有效
 * 通过ldap 用户信息,包括用户权限
 * 生成 token , 保持在 session 中 同时保存在数据库中
 * 将用户信息 存储在 sessionCache;
 *
 * 2.每次访问,
 *  从 session 中 拿到 token
 *  数据库 验证 token 的有效性
 *  根据token 拿到 对应的 用户信息
 *
 * 3.
 * session key  mapping  userId
 *
 */
var tools = require('../../tools');
var ldapService = require("./ldap_service");
var LoginUser = tools.getModelByName("login_user");
var sessionCache = {};
var session_user_key = "session_user_token";

exports.login = function (req, uid, pwd, cb) {
  ldapService.getUserInfo(uid, pwd, function (result) {
    if (result.state == "success") {
      var userInfo = result.userInfo;
      var cUser = null;
      LoginUser.findByUid(uid).then(function (error, user) {
        cUser = user;
        if (tools.isNotObj(cUser)) {
          LoginUser.createByUid(uid).then(function (user) {
            cUser = user;
            if (cUser != null) {
              userInfo.userId = cUser.id;
              var tokenInfo = tools.getUUid();
              var userToken;
              LoginUser.saveToken(userInfo.userId, tokenInfo).then(function (token) {
                userToken = token;
                req.session[session_user_key] = userToken.token_info;
                sessionCache[req.session[session_user_key]] = userInfo;
                console.log(req.session[session_user_key]);
                console.log(sessionCache);
                cb("success");
              });
            }
          });
        } else if (cUser != null) {
          userInfo.userId = cUser.id;
          var tokenInfo = tools.getUUid();
          var userToken;
          LoginUser.saveToken(userInfo.userId, tokenInfo).then(function (token) {
            userToken = token;
            var session = req.session;
            session[session_user_key] = userToken.token_info;
            sessionCache[session[session_user_key]] = userInfo;
            console.log(session[session_user_key]);
            console.log(sessionCache);
            cb("success");
          });
        }
      });
    } else {
      cb("");
    }
  });

};

exports.logOut = function (req, cb) {
  var session = req.session;
  var _session_user_key = session[session_user_key];
  LoginUser.deleteToken(_session_user_key).then(function (info, count) {
    session[_session_user_key] = null;
    sessionCache[_session_user_key] = null;
    cb();
  })
};

exports.checkUser = function (req, cb) {
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
