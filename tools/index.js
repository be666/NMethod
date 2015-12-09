/**
 * Created by bqxu on 15/12/9.
 */
var app = require("loopback");
var pub = {};
pub.isNotEmptyStr = function (str) {
  if (typeof str == 'string' && str.length > 0) return true;
};

pub.isNotObj = function (obj) {
  if (typeof obj == "undefined" || obj == null) return true;
};

pub.getCurrentDateTimeStr = function () {
  var currentDate = new Date();
  var fmt = "yyyy-MM-dd hh:mm:ss";
  var o = {
    "M+": currentDate.getMonth() + 1, //月份
    "d+": currentDate.getDate(), //日
    "h+": currentDate.getHours(), //小时
    "m+": currentDate.getMinutes(), //分
    "s+": currentDate.getSeconds(), //秒
    "q+": Math.floor((currentDate.getMonth() + 3) / 3), //季度
    "S": currentDate.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (currentDate.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
};


pub.getUUid = function (len, radix) {
  var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  var uuid = [], i;
  radix = radix || chars.length;

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
  } else {
    // rfc4122, version 4 form
    var r;

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16;
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
      }
    }
  }
  return uuid.join('');
};


pub.getModelByName = function (modelName) {
  return app.getModel(modelName);
};

module.exports = pub;
