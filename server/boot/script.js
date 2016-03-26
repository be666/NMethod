'use strict';
var tools = require("../../tools");
var uuid = require("uuid");
var async = require("async");
module.exports = function (app) {


  let init = function () {
    var AuthUser = tools.getModelByName("AuthUser");
    var AuthApp = tools.getModelByName("AuthApp");
    var AuthAppUser = tools.getModelByName("AuthAppUser");
    var AuthGroup = tools.getModelByName("AuthGroup");
    var AuthGroupUser = tools.getModelByName("AuthGroupUser");

    async.parallel([
      function (cb) {
        AuthUser.findOrCreate({
            where: {
              id: 1001
            }
          }, {
            id: 1001,
            loginName: "admin",
            userName: "管理员",
            realName: "管理员",
            pwd: tools.ldap_ssha("123456"),
            passWord: tools.md5("123456"),
            sex: 0,
            birthday: "1991-11-06",
            address: "北京合生基因科技有限公司",
            email: "account@syngen.tech"
          }, function (err, user) {
            if (err) {
              tools.logger.debug(err);
            }
            cb();
          }
        );

      }, function (cb) {


        AuthApp.findOrCreate({
            where: {
              id: 1001
            }
          }, {
            id: 1001,
            appName: "linux",
            siteUrl: "localhost",
            siteIp: "",
            appToken: uuid.v4().replace(new RegExp('-', 'g'), ''),
            allowAll: 0,
            allowSign: 0
          }, function (err, user) {
            if (err) {
              tools.logger.debug(err);
            }
            cb();
          }
        );
      }, function (cb) {
        AuthApp.findOrCreate({
            where: {
              id: 1002
            }
          }, {
            id: 1002,
            appName: "account",
            siteUrl: "http://0.0.0.0:3000",
            siteIp: "",
            appToken: "0123456789ZXCVBNMASDFGHJKLQWERTY",
            allowAll: 0,
            allowSign: 0
          }, function (err, user) {
            if (err) {
              tools.logger.debug(err);
            }
            cb();
          }
        );

      }, function (cb) {

        AuthAppUser.findOrCreate({
            where: {
              id: 1001
            }
          }, {
            id: 1001,
            userId: 1001,
            appId: 1002
          }, function (err, user) {
            if (err) {
              tools.logger.debug(err);
            }
            cb();
          }
        );
      }, function (cb) {
        AuthGroup.findOrCreate({
            where: {
              id: 1001
            }
          }, {
            id: 1001,
            gid: 1001,
            groupName: '1001',
            appId: 1001
          }, function (err, user) {
            if (err) {
              tools.logger.debug(err);
            }
            cb();
          }
        );
      }, function (cb) {
        AuthGroup.findOrCreate({
            where: {
              id: 1002
            }
          }, {
            id: 1002,
            gid: 1001,
            groupName: '管理员',
            groupCode: 'admin',
            appId: 1002
          }, function (err, user) {
            if (err) {
              tools.logger.debug(err);
            }
            cb();
          }
        );
      }, function (cb) {
        AuthGroupUser.findOrCreate({
            where: {
              id: 1001
            }
          }, {
            id: 1001,
            userId: 1001,
            appId: 1002,
            groupId: 1002
          }, function (err, user) {
            if (err) {
              tools.logger.debug(err);
            }
            cb();
          }
        );
      }], function () {

    })
  };

  async.mapSeries(app.models(), function (Model, cbx) {
    let dataSource = Model.dataSource;
    if (dataSource.name == 'Memory') {
      return cbx();
    }
    dataSource.autoupdate(Model.modelName)
      .then(function (result) {
        cbx(null);
      }).catch(function (err) {
      cbx(err);
    })
  }, function (err, res) {
    if (!err) {
      console.log('init data')
      return init();
    }
  });

};
