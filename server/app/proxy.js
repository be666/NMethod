'use strict';
let tools = require('../../tools');
let loopback = tools.loopback;
let router = loopback.Router();
let fs = require("fs");
let path = require("path");
let url = require('url');
let urlencode = require('urlencode');
let proxyRule = tools.getArg("proxyRule");


let cacheFileName = function (dist) {
  if (!dist) {
    return null;
  }
  return dist.replace(new RegExp(":", 'g'), '_a_').replace(new RegExp("/", 'g'), '_b_');
};


let MethodHandler = function (purl, dist, match, type, cache) {

  let methodHandler = null;
  if (match == "exact") {
    methodHandler = function (req, res, next) {
      let cacheFile = null;
      if (cache > 0) {
        cacheFile = path.resolve(log_dir, cacheFileName(dist));
      }
      if (type == 'proxy') {
        let httpProxy = tools.proxy(dist, req, res, cacheFile);
        req.pipe(httpProxy)
      } else if (type == 'redirect') {
        res.redirect(dist);
      }
    }
  } else if (match == "start") {
    methodHandler = function (req, res, next) {
      let cacheFile = null;
      let rUrl = req.originalUrl;
      rUrl = rUrl.substring(purl.length, rUrl.length);
      let distUrl = url.resolve(dist, rUrl);
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
};


for (let purl in proxyRule) {
  let proxyObj = proxyRule[purl];
  let dist = proxyObj.to;
  let match = proxyObj.match;
  let type = proxyObj.type;
  let cache = proxyObj.cache;
  let methods = proxyObj.methods;
  let mL = methods.length;
  for (var j = 0; j < mL; j++) {
    let method = methods[j];
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


if (Object.keys(proxyRule).length != 0) {
  let log_dir = path.resolve(__dirname, '../../proxy');

  fs.stat(log_dir, function (err, stat) {
    if (err || !stat.isDirectory()) {
      fs.mkdir(log_dir, function () {

      })
    }
  });
}

module.exports = router;
