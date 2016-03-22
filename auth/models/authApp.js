/**
 * Created by bqxu on 16/3/16.
 */
var uuid = require('uuid');
module.exports = function (AuthApp) {


  AuthApp.insert = function (appName, siteUrl, siteIp, res, cb) {
    var appToken = uuid.v4().replace(new RegExp('-', 'g'), '');
    AuthApp.create({
      appName: appName,
      siteUrl: siteUrl,
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

};
