var App        = require("App");
var config     = require("config");
module.exports = new App.AjaxApi(config.ajax_api);
