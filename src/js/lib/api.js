var App        = require("App");
var config     = require("config");

if(!config.ajax_api) config.ajax_api = {endpoint: "/"};
module.exports = new App.AjaxApi(config.ajax_api);
