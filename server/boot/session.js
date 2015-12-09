/**
 * Created by bqxu on 15/12/9.
 */
var tools = require("../../tools");
module.exports = function SessionMiddleware(app) {
  var cookieParser = require('cookie-parser');
  var session = require("express-session");


  app.use("parse", cookieParser('secret'));

  app.middleware("session", session({
      genid: function (req) {
        return tools.getUUid(32, 36);// use UUIDs for session IDs
      },
      secret: 'hi session',
      name: 'ge.id',
      unset: 'keep',
      resave: true,
      saveUninitialized: true,
      cookie: {secure: false, maxAge: 60000}
    }
  ));

}
