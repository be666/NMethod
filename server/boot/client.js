'use strict';
var tools = require("../../tools");
module.exports = function (app) {

  app.get("/auth", function (req, res) {
    var AuthClient = tools.getModelByName('AuthClient');
    AuthClient.auth(req, res)
  });

  app.get("/logout", function (req, res) {
    var AuthClient = tools.getModelByName('AuthClient');
    AuthClient.logout(req, res)
  });

};
