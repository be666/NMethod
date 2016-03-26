'use strict';
var tools = require("../../tools");
var url = require("url");
var loopback = require("loopback");
function LoginContent(AuthClient) {
  this.sessionCache = {};
  this.user_key = "session_user_token";
  this.auto_user_key = "auto_user_token";
}

LoginContent.prototype.login = function (req, tokenInfo, userInfo) {
  let session = req.session;
  session[this.user_key] = tokenInfo;
  this.sessionCache[tokenInfo] = userInfo;
};

LoginContent.prototype.logout = function (req) {
  let session = req.session;
  var tokenInfo = session[this.user_key];
  this.sessionCache[tokenInfo] = null;
  session[this.user_key] = null;
};

LoginContent.prototype.getUser = function (req) {
  let session = req.session;
  var tokenInfo = session[this.user_key];
  if (!tokenInfo) {
    return null;
  }
  return this.sessionCache[tokenInfo];
};

LoginContent.prototype.getTokenInfo = function (req) {
  let session = req.session;
  if (session == null) {
    return null;
  }
  var tokenInfo = session[this.user_key];
  if (!tokenInfo) {
    return null;
  }
  return tokenInfo;
};

LoginContent.prototype.getCookieInfo = function (req) {
  var cookies = req.cookies;
  if (cookies['atk']) {
    return cookies['atk'];
  }
  return null;
};

LoginContent.prototype.setCookieInfo = function (req, res, tokenInfo) {
  var refer = req.get('Referrer');
  var urlObj = new url.parse(refer);
  res.cookie('atk', tokenInfo, {domain: urlObj.host, path: '/', maxAge: 7 * 24 * 60 * 60 * 1000});
};

let loadUser = function (tokenInfo, cb) {
  var authServer = tools.getArg('authServer');
  let serverUrl = authServer.serverUrl;
  let userInfo = authServer.userInfo;
  let appToken = tools.getArg('authClient').appToken;
  let i = 0;
  tools.httpRequest(url.resolve(serverUrl, userInfo) +
    '?tokenInfo=' + tokenInfo +
    "&appToken=" + appToken, 'get', function (err, resText) {
    i++;
    if (err && i == 1) {
      return cb(err);
    }
    if (!err) {
      let resObj = JSON.parse(resText);
      var userInfo = resObj.userInfo;
      if (!userInfo && i == 1) {
        return cb(tools.getError('无效的用户信息'));
      }
      userInfo.rule = resObj.groupRule;
      if (i == 1) {
        return cb(null, userInfo);
      }
    }
  })
};

let logout = function (tokenInfo, cb) {
  var authServer = tools.getArg('authServer');
  let serverUrl = authServer.serverUrl;
  let loginOut = authServer.logout;
  let appToken = tools.getArg('authClient').appToken;
  let i = 0;
  tools.httpRequest(url.resolve(serverUrl, loginOut) +
    '?tokenInfo=' + tokenInfo +
    "&appToken=" + appToken, 'get', function (err, resText) {
    i++;
    console.log(resText);
    console.log(err);
    if (err && i == 1) {
      return cb(err);
    }
    if (i == 1) {
      return cb(null, resText);
    }
  })
};

module.exports = function (AuthClient) {

  let loginContent = new LoginContent(AuthClient);

  AuthClient.info = function (req, cb) {
    var userInfo = loginContent.getUser(req);
    if (userInfo) {
      cb(null, userInfo);
    } else {
      cb(tools.getError('no login'));
    }
  };

  AuthClient.remoteMethod("info", {
    accepts: {arg: 'req', type: 'object', 'http': {source: 'req'}},
    returns: {arg: 'userInfo', type: 'object'},
    http: {path: "/info", verb: "post"}
  });

  AuthClient.cookieLoginInfo = function (req, cb) {
    let userInfo = loginContent.getUser(req);
    if (userInfo) {
      return cb(userInfo)
    }
    let tokenInfo = loginContent.getCookieInfo(req);
    if (!tokenInfo) {
      return cb(null)
    }
    loadUser(tokenInfo, function (err, userInfo) {
      cb(null, userInfo);
    })
  };

  AuthClient.auth = function (req, res) {
    var tokenInfo = req.query.tokenInfo;
    var authServer = tools.getArg('authServer');
    let serverUrl = authServer.serverUrl;
    let login = authServer.login;
    let appToken = tools.getArg('authClient').appToken;
    loadUser(tokenInfo, function (err, userInfo) {
      if (err) {
        return res.redirect(url.resolve(serverUrl, login) + "?appToken=" + appToken + "&msg=" + encodeURIComponent(err.message))
      }
      loginContent.login(req, tokenInfo, userInfo);
      res.redirect("/");
    });
  };

  AuthClient.logout = function (req, res) {
    var tokenInfo = loginContent.getTokenInfo(req);
    console.log(tokenInfo);
    logout(tokenInfo, function (err) {
      loginContent.logout(req, res);
      res.redirect("/");
    })
  };

  AuthClient.getUser = function (req) {
    return loginContent.getUser(req);
  };

};
