module.exports = function (server) {
  var router = server.loopback.Router();

  router.get('/state', server.loopback.status());
  server.use(router);
};
