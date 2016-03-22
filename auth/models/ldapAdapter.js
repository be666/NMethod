/**
 * Created by bqxu on 16/3/16.
 */
var tools = require('../../tools');
module.exports = function (LdapAdapter) {

  var UserWarp = function (user, authGroups) {
    var authGroup = null;
    authGroups = JSON.parse(JSON.stringify(authGroups));
    if (authGroups.length > 0) {
      authGroup = authGroups[0];
    }
    return {
      dn: 'cn=' + user.loginName + ',ou=Users,dc=syngentech,dc=org',
      attributes: {
        uid: user.loginName,
        mail: user.email,
        uidNumber: user.id,
        loginShell: authGroup != null ? '/bin/bash' : '/bin/nologin',
        userPassword: user.pwd,
        objectClass: ['inetOrgPerson', 'posixAccount', 'top'],
        givenName: user.realName,
        sn: user.realName,
        cn: user.loginName,
        gidNumber: authGroup.group.gid || null,
        homeDirectory: '/home/users/' + user.loginName
      }
    };
  };

  LdapAdapter.searchUserByUid = function (params, cb) {
    tools.logger.debug('searchUserByUid');
    var uid = params[0];
    var AuthUser = tools.getModelByName('AuthUser');
    var AuthGroupUser = tools.getModelByName('AuthGroupUser');
    AuthUser.findOne({
      where: {
        loginName: uid
      }
    }).then(function (user) {
      if (!user) {
        cb(null);
      }
      AuthGroupUser.find({
        where: {
          userId: user.id,
          appId: 1
        },
        include: 'group'
      }).then(function (authGroup) {
        if (authGroup) {
          cb(null, UserWarp(user, authGroup))
        } else {
          cb(null);
        }
      }).catch(function (err) {
        cb(err)
      })
    }).catch(function (err) {
      cb(err)
    });
  };

  var UserGroupWarp = function (user, authGroups) {
    var authGroup = null;
    authGroups = JSON.parse(JSON.stringify(authGroups));
    if (authGroups.length > 0) {
      authGroup = authGroups[0];
    }
    return {
      dn: 'cn=' + authGroup.group.groupName + ',ou=Groups,dc=syngentech,dc=org',
      attributes: {
        cn: authGroup.group.groupName,
        objectClass: ['posixGroup', 'top'],
        gidNumber: String(authGroup.group.gid)
      }
    }
  };

  LdapAdapter.searchGroupByUid = function (params, cb) {
    tools.logger.debug('searchUserByUid');
    var uid = params[0];
    var AuthUser = tools.getModelByName('AuthUser');
    var AuthGroupUser = tools.getModelByName('AuthGroupUser');
    AuthUser.findOne({
      where: {
        loginName: uid
      }
    }).then(function (user) {
      if (!user) {
        cb(null);
      }
      AuthGroupUser.find({
        where: {
          userId: user.id,
          appId: 1
        },
        include: 'group'
      }).then(function (authGroup) {
        if (authGroup) {
          cb(null, UserGroupWarp(user, authGroup))
        } else {
          cb(null);
        }
      }).catch(function (err) {
        cb(err)
      })
    }).catch(function (err) {
      cb(err)
    });
  };
  var GroupWarp = function (authGroup) {
    authGroup = JSON.parse(JSON.stringify(authGroup));
    return {
      dn: 'cn=' + authGroup.groupName + ',ou=Groups,dc=syngentech,dc=org',
      attributes: {
        cn: authGroup.groupName,
        objectClass: ['posixGroup', 'top'],
        gidNumber: String(authGroup.gid)
      }
    }
  };

  LdapAdapter.searchGroupByGid = function (params, cb) {
    tools.logger.debug('searchGroupByGid');
    var gid = params[0];
    var AuthGroup = tools.getModelByName('AuthGroup');
    AuthGroup.findOne({
      where: {
        gid: gid
      }
    }).then(function (authGroup) {
      cb(null, GroupWarp(authGroup))
    }).catch(function (err) {
      cb(err)
    });
  }

  LdapAdapter.checkUser = function (loginName, cb) {
    var AuthUser = tools.getModelByName('AuthUser');
    AuthUser.findOne({
      where: {
        loginName: loginName
      }
    }).then(function (authUser) {
      if (!authUser) {
        cb(null);
      }
      cb(null, authUser)
    }).catch(function (err) {
      cb(err);
    })
  }
};
