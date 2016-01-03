/**
 * Created by bqxu on 15/12/9.
 */
var loopback = require("loopback");
var app = require("../server/server");
var logger = require("./logger");
var pub = {};
pub.loopback = loopback;
pub.app = app;
pub.extend = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
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

pub.getCurrentDateStr = function () {
  var currentDate = new Date();
  var fmt = "yyyy-MM-dd";
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

pub.getCurrentDate = function () {
  return new Date();
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
  return loopback.getModel(modelName);
};

pub.inArray = function (arr, el) {
  arr = arr || [];
  for (var i = 0, k = arr.length; i < k; i++) {
    if (el == arr[i]) {
      return true;
    }
  }
};
pub.inArrayMatch = function (arr, el) {
  arr = arr || [];
  for (var i = 0, k = arr.length; i < k; i++) {
    if (el.indexOf(arr[i]) > -1) {
      return true;
    }
  }
}

pub.getArg = function (arg) {
  return app.get(arg);
};


pub.getCurrentContext = function () {
  return loopback.getCurrentContext();
};

pub.saveUser = function (userInfo) {
  var context = pub.getCurrentContext();
  if (context != null) {
    context.set("threadUserInfo", userInfo);
  }
};
pub.getUser = function () {
  var context = pub.getCurrentContext();
  if (context != null) {
    return context.get("threadUserInfo");
  }
};
pub.buildMap = function (list, code, codeName) {
  var map = {};
  list = list || [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    map[item[code]] = item[codeName];
  }
  return map;
};

pub.getDateExp = function (exp) {
  var timeStr = pub.getCurrentDateStr();
  var timeArr = timeStr.split("-");
  if (12 - timeArr[1] >= exp) {
    timeArr[1] = parseInt(timeArr[1]) + exp;
  } else {
    timeArr[1] = parseInt(timeArr[1]) + exp - 12;
    timeArr[0] = parseInt(timeArr[0]) + 1;
  }
  return new Date(timeArr.join("/"))
};


pub.logger = logger;

pub.debugger = logger.debugger;

module.exports = pub;
