var App = require("App");
module.exports = new App.AppController(App.Controllers, {
  config: require("config"),
  routes: require("../routes.json")
});
