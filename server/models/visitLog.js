var tools = require("../../tools");
module.exports = function (VisitLog) {
  VisitLog.log = function (url) {
    var userInfo = tools.getUserInfo();
    VisitLog.create({
      url: url,
      userId: userInfo.userId,
      userName: userInfo.userName,
      optionTime: new Date().getTime()
    }, function (err, option) {

    })
  }
};
