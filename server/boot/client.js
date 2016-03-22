/**
 * Created by bqxu on 16/3/21.
 */
var tools = require("../../tools");
module.exports = function (app) {

  app.get("/auth", function (req, res) {
    var AuthClient = tools.getModelByName('AuthClient');
    AuthClient.userInfo(req, res)
  });

};
