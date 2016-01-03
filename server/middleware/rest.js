/**
 * Created by bqxu on 15/12/18.
 */
var tools = require("../../tools");
var loopback = tools.loopback;
var async = require('async');

module.exports = rest;

function rest() {
  var handlers;

  return function restApiHandler(req, res, next) {
    var app = req.app;
    var registry = app.registry;

    if (app.get('legacyExplorer') !== false) {
      if (req.url === '/routes') {
        return res.send(app.handler('rest').adapter.allRoutes());
      } else if (req.url === '/models') {
        return res.send(app.remotes().toJSON());
      }
    }

    if (!handlers) {
      handlers = [];

      if (app.isAuthEnabled) {
        var AccessToken = registry.getModelByType('AccessToken');
        handlers.push(loopback.token({model: AccessToken, app: app}));
      }

      handlers.push(function (req, res, next) {
        // Need to get an instance of the REST handler per request
        return app.handler('rest')(req, res, next);
      });
    }
    if (handlers.length === 1) {
      return handlers[0](req, res, next);
    }
    async.eachSeries(handlers, function (handler, done) {
      handler(req, res, done);
    }, next);
  };
}


