/**
 * Created by bqxu on 16/1/5.
 */
var tools = require("../../tools");
var uuid = require("uuid");
module.exports = function (app) {
  var AuthUser = tools.getModelByName("AuthUser");
  AuthUser.findOrCreate({
      id: 1001,
      loginName: "admin",
      userName: "bqxu",
      realName: "bqxu",
      pwd: tools.ldap_ssha("123456"),
      passWord: tools.md5("123456"),
      sex: 0,
      birthday: "1991-11-06",
      address: "iMethod",
      email: "bcaring@163.com"
    }, function (err, user) {
      if (err) {
        console.log(err)
      } else {
        console.log(user)
      }
    }
  );

  var AuthApp = tools.getModelByName("AuthApp");

  AuthApp.findOrCreate({
      id: 1001,
      appName: "linux",
      siteUrl: "localhost",
      siteIp: "",
      appToken: uuid.v4().replace(new RegExp('-', 'g'), '')
    }, function (err, user) {
      if (err) {
        console.log(err)
      } else {
        console.log(user)
      }
    }
  );

  var AuthGroup = tools.getModelByName("AuthGroup");
  AuthGroup.findOrCreate({
      id: 1001,
      gid: 1001,
      groupName: '501',
      appId: 1
    }, function (err, user) {
      if (err) {
        console.log(err)
      } else {
        console.log(user)
      }
    }
  );

};
