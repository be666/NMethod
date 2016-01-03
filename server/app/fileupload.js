/**
 * Created by bqxu on 15/12/19.
 */
var tools = require("../../tools")
var loopback = tools.loopback;
var router = loopback.Router();
var fs = require("fs");
var path = require("path");
var uploadConfig = tools.getArg("fileUpload");
var dist = path.resolve(uploadConfig.dist);

// 定义网站主页的路由
router.post('/', function (req, res) {
  var fileUpload = req.files['fileUpload'];
  var filePath = path.parse(fileUpload.path);
  var distPath = path.join(dist, filePath.base);
  fs.rename(fileUpload.path, distPath, function () {
    res.json({
      name: fileUpload.name,
      size: fileUpload.size,
      path: filePath.base
    });
  });
});

module.exports = router;
