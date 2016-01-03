var multipart = require('connect-multiparty');
var tools = require("../../tools");
var fs = require("fs");
var path = require("path");
var uploadConfig = tools.getArg("fileUpload");
var dist = path.resolve(uploadConfig.dist);
var tmp = path.resolve(uploadConfig.tmp);
var multipartMiddleware = multipart({
  uploadDir: tmp
});

fs.stat(dist, function (err, stat) {
  if (err || !stat.isDirectory()) {
    fs.mkdir(dist, function () {

    })
  }
});

fs.stat(tmp, function (err, stat) {
  if (err || !stat.isDirectory()) {
    fs.mkdir(tmp, function () {

    })
  }
});

module.exports = function (option) {
  return multipartMiddleware
};
