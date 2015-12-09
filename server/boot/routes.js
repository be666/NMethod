var authService = require("../auth/auth_service");
var tools = require("../../tools");

module.exports = function (app) {

  app.all("*", function (req, res, next) {
    if (req.originalUrl != "/login") {
      authService.checkUser(req, function (loginUser) {
        if (tools.isNotObj(loginUser)) {
          res.redirect("/login");
        } else {
          next();
        }
      });
    } else {
      next();
    }
  });


  app.get('/login', function (req, res) {
    authService.login(req, "bq.xu", "Abc123456", function (resx) {
      if (resx == "success") {
        res.send("loginSuccess");
      } else {
        res.send("loginFalse");
      }
    });
  });

  app.get('/logout', function (req, res) {
    authService.logOut(req, function () {
      authService.checkUser(req, function (loginUser) {
        if (tools.isNotObj(loginUser)) {
          res.send("logout success");
        } else {
          res.send("logout false");
        }
      });

    })
  });

};
