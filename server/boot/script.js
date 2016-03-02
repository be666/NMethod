/**
 * Created by bqxu on 16/1/5.
 */
var tools = require("../../tools");
module.exports = function (app) {
  var User = tools.getModelByName("User");
  User.findOrCreate({
      "id": 1,
      "loginName": "Admin",
      "userName": "管理员",
      "createdAt": "2016-02-29T11:52:20.301Z",
      "password": "123456",
      "state": 1,
      "sex": "0",
      "realName": "徐柏清",
      "email": "bcaring@163.com",
      "updatedAt": "2016-02-29T16:15:04.595Z"
    }, function (err, user) {
      if (err) {
        console.log(err)
      } else {
        console.log(user)
      }
    }
  )
};
