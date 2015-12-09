/**
 * Created by bqxu on 15/12/8.
 */
var ldap = require('ldapjs');
var getUserDn = function (uid) {
  var dn = [];
  dn.push("cn=" + uid);
  dn.push("ou=Users");
  dn.push("dc=syngentech");
  dn.push("dc=org");
  return dn.join(",");
};


var getAppDn = function (app) {
  var dn = [];
  dn.push("ou=" + app);
  dn.push("ou=Applications");
  dn.push("dc=syngentech");
  dn.push("dc=org");
  return dn.join(",");
};
var getGroupDn = function (app, grp) {
  var dn = [];
  //dn.push("cn=" + grp);
  //dn.push("ou=" + app);
  dn.push("ou=Applications");
  dn.push("dc=syngentech");
  dn.push("dc=org");
  return dn.join(",");
};

var ldapUserModel = function (str) {
  str = str || "{}";
  if (typeof str == "string") {
    str = JSON.parse(str);
  }
  return {
    cn: str['cn'],
    displayName: str['displayName'],
    givenName: str['givenName'],
    controls: str['controls'],
    sn: str['sn'],
    mail: str['mail'],
    objectClass: str['objectClass']
  }
};
exports.getUserInfo = function (uid, pwd, cb) {
  var userInfo = {
    userName: "",
    userRule: []
  };
  var client = ldap.createClient({
    url: 'ldap://account.syngentech.org'
  });
  client.bind(getUserDn(uid), pwd, function (err, resx) {
    var queryUserInfo = function () {
      client.search(getUserDn("bq.xu"), {
      }, function (err, res) {
        res.on('searchEntry', function (entry) {
          userInfo.userName = new ldapUserModel(entry.object).displayName;
        });
        res.on('searchReference', function (referral) {
        });
        res.on('error', function (err) {
          client.unbind();
          cb({
            "state": false
          });
        });
        res.on('end', function (result) {
          queryUserRule();
        });
      });
    };

    var queryUserRule = function () {
      var uid='ad.tan';
      var opts = {
        filter: "&(member=" + getUserDn(uid) + ")",
        scope: 'sub'
      };
      client.search(getGroupDn("*"), opts, function (err, res) {
        res.on('searchEntry', function (entry) {
          userInfo.userRule.push(entry.object['cn']);
        });
        res.on('searchReference', function (referral) {
        });
        res.on('error', function (err) {
          client.unbind();
          cb({
            "state": false
          });
        });
        //查询结束
        res.on('end', function (result) {
          //unbind操作，必须要做
          client.unbind();
          cb({
            "state": "success",
            "userInfo": userInfo
          });
        });
      });
    }

    if (err) {
      console.error('error: ' + err.message);
      //unbind操作，必须要做
      client.unbind();
      cb({
        "state": false
      });
    }else{
      queryUserInfo();
    }
  });
};
