'use strict';
var proxy = require("../app/proxy");
var path = require('path');
module.exports = function (app) {

  app.get("/admin", function (req, res) {
    res.sendFile(path.resolve(__dirname, '../../client/admin.html'))
  });

  app.get("/login", function (req, res) {
    res.sendFile(path.resolve(__dirname, '../../client/login.html'))
  });

  app.get("/sign", function (req, res) {
    res.sendFile(path.resolve(__dirname, '../../client/sign.html'))
  });

  app.get('/state', app.loopback.status());

  app.use(proxy);

};
