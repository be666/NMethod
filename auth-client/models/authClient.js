/**
 * Created by bqxu on 16/3/16.
 */
var AuthConfig = require("../config/auth-client.json");
var tools = require("../../tools");
var authService = require("../../server/service/auth_service");
var url = require("url");
module.exports = function (AuthClient) {

  AuthClient.userInfo = function (req, res) {
    var tokenInfo = req.query.tokenInfo;
    tools.httpRequest(url.resolve(AuthConfig.authUrl, AuthConfig.userInfo) +
      '?tokenInfo=' + tokenInfo +
      "&appToken=" + AuthConfig.appToken, 'get', function (err, resText) {
      var resObj = JSON.parse(resText);
      var userInfo = resObj.userInfo;
      userInfo.rule = resObj.groupRule;
      if (err) {
        res.redirect(url.resolve(AuthConfig.authUrl, AuthConfig.login) + "?appToken=" + AuthConfig.appToken + "&msg=" + encodeURIComponent(err.message))
        return;
      }
      authService.clientLogin(req, tokenInfo, userInfo);
      res.redirect(url.resolve(AuthConfig.authUrl, "/"));
    })
  };

};
