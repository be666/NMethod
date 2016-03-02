/**
 * Created by bqxu on 16/3/1.
 */
module.exports = function (option) {

  var proxyMiddleware = (req, res, next)=> {
    next();
  };
  return proxyMiddleware;
};
