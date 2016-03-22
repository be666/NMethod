var tools = require("../../tools");
module.exports = function (LoginUser) {

  LoginUser.findByToken = function (token) {
    var AuthUserToken = tools.getModelByName('AuthUserToken');
    return AuthUserToken.findOne({where: {tokenInfo: token, state: 1}})
  };

  LoginUser.findUserById = function (userId) {
    var AuthUser = tools.getModelByName('AuthUser');
    return AuthUser.findById(userId)
  };

  LoginUser.findByLoginName = function (loginName) {
    var AuthUser = tools.getModelByName('AuthUser');
    return AuthUser.findOne({
      where: {
        loginName: loginName
      }
    })
  };

  LoginUser.createByLoginName = function (loginName) {
    var AuthUser = tools.getModelByName('AuthUser');
    return AuthUser.create({
      id: 0,
      loginName: loginName,
      state: 1,
      createAt: tools.getCurrentDateStr()
    })
  };

  LoginUser.saveToken = function (userId, token, ips) {
    var AuthUserToken = tools.getModelByName('AuthUserToken');
    return AuthUserToken.create({id: 0, userId: userId, tokenInfo: token, ips: ips, state: 1});
  };

  LoginUser.deleteToken = function (token) {
    var AuthUserToken = tools.getModelByName('AuthUserToken');
    return AuthUserToken.updateAll({tokenInfo: token, state: 0});
  };

  LoginUser.getUserInfo = function (loginName, pwd, cb) {
    var AuthUser = tools.getModelByName('AuthUser');
    return AuthUser.findOne({where: {loginName: loginName, passWord: pwd}}, function (err, authUser) {
      if (authUser != null) {
        return cb({
          state: "success",
          userInfo: authUser
        })
      }
      cb({state: "false"});
    })
  }
};
