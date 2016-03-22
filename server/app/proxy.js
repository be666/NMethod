/**
 * Created by bqxu on 16/3/1.
 */
var tools = require('../../tools');
var loopback = tools.loopback;
var router = loopback.Router();
var fs = require("fs");
var path = require("path");
var url = require('url');
var urlencode = require('urlencode');

var proxyRule = tools.getArg("proxyRule");
for (var purl in proxyRule) {
  var proxyObj = proxyRule[purl];
  var dist = proxyObj.to;
  var match = proxyObj.match;
  var type = proxyObj.type;
  var cache = proxyObj.cache;
  var methods = proxyObj.methods;
  var mL = methods.length;
  for (var j = 0; j < mL; j++) {
    var method = methods[j];
    if (type == 'redirect' && method != 'get') {
      continue;
    }
    if (method != 'get') {
      cache = 0;
    }
    if (match == "exact") {
      router[method](purl, new MethodHandler(purl, dist, match, type, cache))
    } else {
      router[method](path.resolve(purl, "*"), new MethodHandler(purl, dist, match, type, cache))
    }
  }
}


var log_dir = path.resolve(__dirname, '../../proxy');

fs.stat(log_dir, function (err, stat) {
  if (err || !stat.isDirectory()) {
    fs.mkdir(log_dir, function () {

    })
  }
});


var cacheFileName = function (dist) {
  if (!dist) {
    return null;
  }
  return dist.replace(new RegExp(":", 'g'), '_a_').replace(new RegExp("/", 'g'), '_b_');
};

function MethodHandler(purl, dist, match, type, cache) {

  var methodHandler = null;
  if (match == "exact") {
    methodHandler = function (req, res, next) {
      var cacheFile = null;
      if (cache > 0) {
        cacheFile = path.resolve(log_dir, cacheFileName(dist));
      }
      if (type == 'proxy') {
        var httpProxy = tools.proxy(dist, req, res, cacheFile);
        req.pipe(httpProxy)
      } else if (type == 'redirect') {
        res.redirect(dist);
      }
    }
  } else if (match == "start") {
    methodHandler = function (req, res, next) {

      var rUrl = req.originalUrl;
      rUrl = rUrl.substring(purl.length, rUrl.length);
      var distUrl = url.resolve(dist, rUrl);
      var cacheFile = null;
      if (cache > 0) {
        cacheFile = path.resolve(log_dir, cacheFileName(distUrl));
      }
      if (type == 'proxy') {
        var httpProxy = tools.proxy(distUrl, req, res, cacheFile);
        req.pipe(httpProxy)
      } else if (type == 'redirect') {
        res.redirect(distUrl);
      }
    }
  } else {
    methodHandler = function (req, res, next) {
      next();
    }
  }
  return methodHandler;
}

module.exports = router;
