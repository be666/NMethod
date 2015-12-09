var tools = require("../../tools");
module.exports = function (LoginUser) {
  console.log(tools);
  console.log(tools.getModelByName);
  var User = tools.getModelByName('user');
  var UserToken = tools.getModelByName('user_token');
  LoginUser.findByUid = function (uid) {
    return User.findOne({where: {ldap_uid: uid}})
  };

  LoginUser.findByToken = function (token) {
    return UserToken.findOne({where: {token_info: token, state: 1}})
  };

  LoginUser.findById = function (userId) {
    return UserToken.findById(userId)
  };

  LoginUser.createByUid = function (uid) {
    return User.create({ldap_uid: uid, state: 1, create_at: tools.getCurrentDateTimeStr()})
  };

  LoginUser.saveToken = function (userId, token) {
    return UserToken.create({user_id: userId, token_info: token});
  };

  LoginUser.deleteToken = function (token) {
    return UserToken.updateAll({token_info: token, state: 0});
  }

};
