'use strict';
let async = require('async');
let tools = require('../../tools');
module.exports = function (AuthAppUser) {

  AuthAppUser.bindUser = function (appId, userIds, cb) {
    let AuthUser = tools.getModelByName('AuthUser');
    let AuthApp = tools.getModelByName('AuthApp');
    AuthApp.findOne({
      where: {
        id: appId
      }
    }).then(function (app) {
      if (!app) {
        return cb(tools.getError('无效的应用信息'));
      }
      async.eachSeries(userIds, function (userId, cbx) {
        AuthUser.findOne({
          where: {
            id: userId
          }
        }).then(function (user) {
          if (!user) {
            return cbx(tools.getError('无效的用户信息'));
          }
          AuthAppUser.findOrCreate({
            userId: userId,
            appId: appId
          }).then(function () {
            cbx(null)
          }).catch(function (err) {
            cbx(err)
          })
        }).catch(function (err) {
          cbx(err)
        })
      }, function (err, res) {
        if (err) {
          return cb(err);
        } else {
          return cb(null, 'success');
        }
      });
    }).catch(function (err) {
      return cb(err);
    })

  };

  AuthAppUser.remoteMethod("bindUser", {
    accepts: [
      {arg: 'appId', type: 'number'},
      {arg: 'userIds', type: 'array'}
    ],
    returns: {arg: 'state', type: 'string'},
    http: {path: "/bind", verb: "post"}
  });

};
