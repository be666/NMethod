/**
 * Created by bqxu on 16/3/18.
 */

var async = require('async');
var tools = require('../../tools');

module.exports = function (AuthGroupUser) {

  AuthGroupUser.bindUser = function (appId, groupId, userIds, cb) {
    var AuthUser = tools.getModelByName('AuthUser');
    var AuthGroup = tools.getModelByName('AuthGroup');
    AuthGroup.findOne({
      where: {
        appId: appId,
        id: groupId
      }
    }).then(function (appGroup) {
      if (!appGroup) {
        return cb(tools.getError('无效的应用、分组'));
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
          AuthGroupUser.findOrCreate({
            userId: userId,
            appId: appId,
            groupId: groupId
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

  AuthGroupUser.remoteMethod("bindUser", {
    accepts: [
      {arg: 'appId', type: 'number'},
      {arg: 'groupId', type: 'number'},
      {arg: 'userIds', type: 'array'}
    ],
    returns: {arg: 'state', type: 'string'},
    http: {path: "/bind", verb: "post"}
  });

};
