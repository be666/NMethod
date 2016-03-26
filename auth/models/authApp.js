'use strict';
let uuid = require('uuid');
let tools = require("../../tools");
let async = require("async");
module.exports = function (AuthApp) {


  AuthApp.insert = function (appName, siteUrl, siteIp, res, cb) {
    var appToken = uuid.v4().replace(new RegExp('-', 'g'), '');
    AuthApp.create({
      appName: appName,
      //siteUrl: siteUrl,
      siteIp: siteIp,
      appToken: appToken
    }).then(function (authApp) {
      res.send(authApp);
    }).catch(function (err) {
      cb(err);
    })
  };

  AuthApp.remoteMethod("insert", {
    accepts: [
      {arg: 'appName', type: 'string'},
      {arg: 'siteUrl', type: 'string'},
      {arg: 'siteIp', type: 'string'},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    http: {path: "/insert", verb: "post"}
  });


  AuthApp.me = function (req, res, cb) {
    var AuthApp = tools.getModelByName('AuthApp');
    var AuthAppUser = tools.getModelByName('AuthAppUser');
    var AuthGroupUser = tools.getModelByName('AuthGroupUser');
    var userInfo = tools.getUser();
    if (!userInfo) {
      cb(tools.getError("无法获取用户信息!"))
    }
    var userId = userInfo.id;
    async.series({
      pubApp: function (cbx) {
        AuthApp.find({
          where: {
            state: 1,
            allowAll: 1
          }
        }).then(function (authApp) {
          cbx(null, JSON.parse(JSON.stringify(authApp)))
        }).catch(function (err) {
          cbx(err)
        })
      },
      priApp: function (cbx) {
        AuthAppUser.find({
          where: {
            state: 1,
            userId: userId
          },
          include: 'app'
        }).then(function (authApp) {
          authApp = JSON.parse(JSON.stringify(authApp));
          var apps = [];
          for (var k in authApp) {
            apps.push(authApp[k]['app']);
          }
          cbx(null, apps)
        }).catch(function (err) {
          cbx(err)
        })
      }
    }, function (err, resx) {
      if (err) {
        cb(err);
      }
      var pubApp = resx.pubApp;
      var priApp = resx.priApp;
      var authApps = [];
      var pubL = pubApp.length;
      var authL = null;
      var exist;
      while (pubL--) {
        exist = false;
        authL = authApps.length;
        while (authL--) {
          if (authApps[authL]['id'] == pubApp[pubL]['id']) {
            exist = true;
            continue;
          }
        }
        if (!exist) {
          authApps.push(pubApp[pubL]);
        }
      }
      var priL = priApp.length;
      while (priL--) {
        exist = false;
        authL = authApps.length;
        while (authL--) {
          if (authApps[authL]['id'] == priApp[priL]['id']) {
            exist = true;
            break;
          }
        }
        if (!exist) {
          authApps.push(priApp[priL]);
        }
      }
      async.mapSeries(authApps, function (aApp, cbx) {
        AuthGroupUser.find({
          where: {
            and: [{
              userId: userId
            },
              {appId: aApp.id}
            ]
          },
          include: 'group'
        }).then(function (groupUser) {
          groupUser = JSON.parse(JSON.stringify(groupUser));
          var groups = [];
          for (var k in groupUser) {
            groups.push(groupUser[k]['group']);
          }
          aApp.appToken = '';
          aApp.groupList = groups;
          cbx(null, aApp)
        }).catch(function (err) {
          cbx(err)
        })
      }, function (err, resx) {
        if (err) {
          return cb(err);
        }
        res.send(resx);
        cb(null)
      });
    });
  };

  AuthApp.remoteMethod("me", {
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    http: {path: "/me", verb: "get"}
  });

};
