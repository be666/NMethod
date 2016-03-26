'use strict';
var tools = require("../../tools");
var session = require("express-session");
module.exports = function (option) {
  return session({
      genid: function (req) {
        return tools.getUUid(10, 32);// use UUIDs for session IDs
      },
      secret: 'hi session',
      name: 'ge.id',
      unset: 'keep',
      rolling: true,
      resave: true,
      saveUninitialized: true
    }
  )
};
