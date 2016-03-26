'use strict';
let tools = require("../../tools");
let async = require("async");
module.exports = function (AuthUser) {

  AuthUser.modify = function (id, userName, email, telephone, passWord, cb) {
    var uObj = {
      userName: userName,
      email: email,
      telephone: telephone
    };
    if (passWord) {
      uObj['passWord'] = tools.md5(passWord);
      uObj['pwd'] = tools.ldap_ssha(passWord)
    }
    AuthUser.updateAll({
      id: id
    }, uObj).then(function (info, count) {
      cb(null, 'success');
    }).catch(function (err) {
      cb(err)
    })
  };

  AuthUser.remoteMethod("modify", {
    accepts: [
      {arg: 'id', type: 'number', required: true},
      {arg: 'userName', type: 'string', required: true},
      {arg: 'email', type: 'string', required: true},
      {arg: 'telephone', type: 'string', required: true},
      {arg: 'passWord', type: 'string', required: false}
    ],
    returns: {arg: 'state', type: 'string'},
    http: {path: "/modify", verb: "post"}
  });


  AuthUser.login = function (req, loginName, passWord) {

  }
};
