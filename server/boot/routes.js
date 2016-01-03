var fileUpload = require("../app/fileupload");
module.exports = function (app) {
  app.use('/fileUpload',fileUpload);
};
