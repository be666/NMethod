'use strict';
let tools = require('../../tools');
let async = require("async");
module.exports = function (AuthServer) {

  AuthServer.login = function (req, res, username, password, app_token, cb) {
    var AuthUser = tools.getModelByName('AuthUser');
    var AuthApp = tools.getModelByName('AuthApp');
    var AuthAppUser = tools.getModelByName('AuthAppUser');
    var AuthUserToken = tools.getModelByName('AuthUserToken');
    async.series({
      authUser: function (cbx) {
        AuthUser.findOne({
          where: {
            state: 1,
            or: [{
              email: username
            }, {
              loginName: username
            }]
          }
        }).then(function (authUser) {
          if (!authUser || !tools.ssha_check(password, authUser.pwd)) {
            return cb(tools.getError("用户名、密码不正确!"));
          }
          cbx(null, authUser)
        }).catch(function (err) {
          cbx(err);
        })
      },
      authApp: function (cbx) {
        if (!app_token) {
          app_token = tools.getArg('authClient').appToken;
        }

        if (!app_token) {
          return cbx(tools.getError("无效的应用信息"));
        }
        AuthApp.findOne({
          where: {
            state: 1,
            appToken: app_token
          }
        }).then(function (authApp) {
          if (!authApp) {
            return cbx(tools.getError("无效的应用信息"));
          }
          cbx(null, authApp)
        }).catch(function (err) {
          cbx(err);
        })
      }
    }, function (err, AU) {
      if (err) {
        console.log(err);
        return cb(tools.getError("您当前的登录用户不能在当前应用下使用,没有权限!"));
      }
      var authApp = AU.authApp;
      var authUser = AU.authUser;
      AuthAppUser.findOne({
        where: {
          state: 1,
          appId: authApp.id,
          userId: authUser.id
        }
      }).then(function (authAppUser) {
        if (!authApp.allowAll && !authAppUser) {
          return cb(tools.getError("您当前的登录用户不能在当前应用下使用,没有权限!"));
        }
        var tokenInfo = tools.getUUid();
        AuthUserToken.create({
          state: 1,
          userId: authUser.id,
          tokenInfo: tokenInfo
        }).then(function (token) {
          cb(null, token.tokenInfo, authApp);
        }).catch(function (err) {
          cb(err);
        })
      }).catch(function (err) {
        cb(err);
      })
    });
  };

  AuthServer.remoteMethod("login", {
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}},
      {arg: 'username', type: 'string', required: true},
      {arg: 'password', type: 'string', required: true},
      {arg: 'app_token', type: 'string', required: true}
    ],
    returns: [
      {arg: 'tokenInfo', type: 'object'},
      {arg: 'authApp', type: 'object'}
    ],
    http: {path: "/login", verb: "post"}
  });

  AuthServer.sign = function (res, app_token,
                              loginName, realName, username,
                              passWord,
                              telephone, birthday, address,
                              email, sex, cb) {

    var AuthApp = tools.getModelByName('AuthApp');
    var AuthUser = tools.getModelByName('AuthUser');
    var AuthAppUser = tools.getModelByName('AuthAppUser');
    if (!app_token) {
      app_token = tools.getArg('authClient').appToken;
    }
    if (!app_token) {
      return cb(tools.getError("无效的应用信息"));
    }
    AuthApp.findOne({
      where: {
        state: 1,
        appToken: app_token
      }
    }).then(function (authApp) {
      if (!authApp) {
        return cb(tools.getError('无效的应用信息'))
      }
      if (!authApp.allowSign) {
        return cb(tools.getError('当前未开放注册功能,请联系管理员!'))
      }
      AuthUser.create({
        loginName: loginName,
        realName: realName,
        userName: username,
        telephone: telephone,
        passWord: tools.md5(passWord),
        pwd: tools.ldap_ssha(passWord),
        birthday: birthday,
        address: address,
        email: email,
        sex: sex,
        signAppId: authApp.id
      }).then(function (authUser) {
        if (!authUser) {
          return cb(tools.getError('不能创建用户,请稍后再试'))
        }
        AuthAppUser.create({
          userId: authUser.id,
          appId: authApp.id
        }).then(function (authUser) {
          res.send(authApp);
          return cb(null)
        }).catch(function (err) {
          cb(err)
        })
      }).catch(function (err) {
        cb(err)
      })
    }).catch(function (err) {
      cb(err)
    })
  };

  AuthServer.remoteMethod("sign", {
    accepts: [
      {arg: 'res', type: 'object', 'http': {source: 'res'}},
      {arg: 'app_token', type: 'string', required: true},
      {arg: 'loginName', type: 'string', required: true},
      {arg: 'realName', type: 'string', required: true},
      {arg: 'passWord', type: 'string', required: true},
      {arg: 'userName', type: 'string', required: true},
      {arg: 'telephone', type: 'string', required: true},
      {arg: 'birthday', type: 'string', required: true},
      {arg: 'address', type: 'string', required: true},
      {arg: 'email', type: 'string', required: true},
      {arg: 'sex', type: 'string', required: true}
    ],
    http: {path: "/sign", verb: "post"}
  });


  AuthServer.info = function (res, tokenInfo, appToken, cb) {

    var AuthUserToken = tools.getModelByName('AuthUserToken');
    var AuthApp = tools.getModelByName('AuthApp');
    var AuthAppUser = tools.getModelByName('AuthAppUser');
    var AuthGroupUser = tools.getModelByName('AuthGroupUser');
    async.series({
      authUser: function (cbx) {
        AuthUserToken.findOne({
          where: {
            state: 1,
            tokenInfo: tokenInfo
          },
          include: 'user'
        }).then(function (token) {
          token = JSON.parse(JSON.stringify(token));
          if (!token) {
            return cbx(tools.getError('无效的用户凭证'));
          }

          cbx(null, token.user);
        }).catch(function (err) {
          cbx(err);
        })
      },
      authApp: function (cbx) {
        if (!appToken) {
          appToken = tools.getArg('authClient').appToken;
        }
        if (!appToken) {
          return cbx(tools.getError("无效的应用信息"));
        }
        AuthApp.findOne({
          where: {
            state: 1,
            appToken: appToken
          }
        }).then(function (app) {
          if (!app) {
            return cb(tools.getError('无效的应用凭证'));
          }
          cbx(null, app);
        }).catch(function (err) {
          cbx(err);
        })
      }
    }, function (err, UA) {
      if (err) {
        return cb(tools.getError('该用户没有当前应用的访问权限'));
      }
      var authUser = UA.authUser;
      var authApp = UA.authApp;
      async.series({
        userApp: function (cbx) {
          if (authApp.allowAll) {
            return cbx(null, null);
          }
          AuthAppUser.findOne({
            where: {
              state: 1,
              appId: authApp.id,
              userId: authUser.id
            }
          }).then(function (appUser) {
            if (!appUser) {
              return cb(tools.getError('该用户没有当前应用的访问权限'));
            }
            cbx(null, null);
          }).catch(function (err) {
            cbx(err);
          })
        },
        userGroup: function (cbx) {
          AuthGroupUser.find({
            where: {
              state: 1,
              userId: authUser.id,
              appId: authApp.id
            },
            include: 'group'
          }).then(function (groupUser) {
            groupUser = JSON.parse(JSON.stringify(groupUser));
            var group = [];
            for (var key in groupUser) {
              group.push(groupUser[key]['group']['groupCode']);
            }
            cbx(null, group);
          }).catch(function (err) {
            cbx(err);
          })
        }
      }, function (err, AG) {
        var userGroup = AG.userGroup;
        cb(null, {
          id: authUser.id,
          loginName: authUser.loginName,
          realName: authUser.realName,
          userName: authUser.userName,
          email: authUser.email,
          telephone: authUser.telephone,
          sex: authUser.sex,
          birthday: authUser.birthday
        }, userGroup)
      });
    });
  };

  AuthServer.remoteMethod("info", {
    accepts: [
      {arg: 'res', type: 'object', 'http': {source: 'res'}},
      {arg: 'tokenInfo', type: 'string', required: true},
      {arg: 'appToken', type: 'string', required: true}
    ],
    returns: [
      {arg: 'userInfo', type: 'object'},
      {arg: 'groupRule', type: 'array'}
    ],
    http: {path: "/info", verb: "get"}
  });


  AuthServer.logout = function (res, tokenInfo, appToken, cb) {

    var AuthUserToken = tools.getModelByName('AuthUserToken');
    var AuthApp = tools.getModelByName('AuthApp');
    var AuthAppUser = tools.getModelByName('AuthAppUser');
    async.series({
      authUser: function (cbx) {
        AuthUserToken.findOne({
          where: {
            state: 1,
            tokenInfo: tokenInfo
          },
          include: 'user'
        }).then(function (token) {
          token = JSON.parse(JSON.stringify(token));
          if (!token) {
            return cbx(tools.getError('无效的用户凭证'));
          }

          cbx(null, token.user);
        }).catch(function (err) {
          cbx(err);
        })
      },
      authApp: function (cbx) {
        if (!appToken) {
          appToken = tools.getArg('authClient').appToken;
        }
        if (!appToken) {
          return cbx(tools.getError("无效的应用信息"));
        }
        AuthApp.findOne({
          where: {
            state: 1,
            appToken: appToken
          }
        }).then(function (app) {
          if (!app) {
            return cb(tools.getError('无效的应用凭证'));
          }
          cbx(null, app);
        }).catch(function (err) {
          cbx(err);
        })
      }
    }, function (err, UA) {
      var authUser = UA.authUser;
      var authApp = UA.authApp;
      console.log('authAppauthAppauthApp')
      AuthUserToken.updateAll({
        state: 1,
        tokenInfo: tokenInfo
      }, {
        state: 0
      }).then(function (token) {
        console.log(token);
        cb(null, 'success');
      }).catch(function (err) {
        cb(err);
      })
    });
  };

  AuthServer.remoteMethod("logout", {
    accepts: [
      {arg: 'res', type: 'object', 'http': {source: 'res'}},
      {arg: 'tokenInfo', type: 'string', required: true},
      {arg: 'appToken', type: 'string', required: true}
    ],
    returns: [
      {arg: 'state', type: 'string'}
    ],
    http: {path: "/logout", verb: "get"}
  });

};
