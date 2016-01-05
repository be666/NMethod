var tools = require("../../tools");
module.exports = function (LoginUser) {

  LoginUser.findByToken = function (token) {
    var UserToken = tools.getModelByName('UserToken');
    return UserToken.findOne({where: {tokenInfo: token, state: 1}})
  };

  LoginUser.findUserById = function (userId) {
    var User = tools.getModelByName('User');
    return User.findById(userId)
  };

  LoginUser.findByLoginName = function (loginName) {
    var User = tools.getModelByName('User');
    return User.findOne({
      where: {
        loginName: loginName
      }
    })
  };

  LoginUser.createByLoginName = function (loginName) {
    var User = tools.getModelByName('User');
    return User.create({
      id: 0,
      loginName: loginName,
      state: 1,
      createAt: tools.getCurrentDateStr()
    })
  };

  LoginUser.saveToken = function (userId, token) {
    var UserToken = tools.getModelByName('UserToken');
    return UserToken.create({id: 0, userId: userId, tokenInfo: token, state: 1});
  };

  LoginUser.deleteToken = function (token) {
    var UserToken = tools.getModelByName('UserToken');
    return UserToken.updateAll({tokenInfo: token, state: 0});
  }

  LoginUser.getUserInfo = function (loginName, pwd, cb) {
    var User = tools.getModelByName('User');
    return User.findOne({where: {loginName: loginName, password: pwd}}, function (err, user) {
      if (user != null) {
        return cb({
          state: "success",
          userInfo: user
        })
      }
      cb({state: "false"});
    })
  }
};
