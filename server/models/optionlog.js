var tools = require("../../tools");
module.exports = function (OptionLog) {
  OptionLog.option = function (action, req) {
    var userInfo = tools.getUserInfo();
    OptionLog.create({
      action: action,
      req:JSON.stringify(req),
      userId: userInfo.userId,
      userName: userInfo.userName,
      optionTime: new Date().getTime()
    }, function (err, option) {

    })
  }
};
