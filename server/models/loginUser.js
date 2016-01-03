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

  LoginUser.createByUid = function (uid, userName, rule) {
    var User = tools.getModelByName('User');
    return User.create({
      id: 0,
      userName: userName,
      rule: JSON.stringify(rule),
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

  LoginUser.getUserInfo=function(uid, pwd){
    return User.findOne({where: {uid: uid,pwd: pwd}})
  }
};
