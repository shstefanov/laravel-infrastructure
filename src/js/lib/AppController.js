var Controller = require("./Controller.js");
var Router     = require("./Router.js");

module.exports = Controller.extend("BaseAppController", {

  init: function(options, cb){
    if(cb) this.once("ready", cb, this);
    var controllers = require("controllers");
    if(!controllers.__ready){
      var self = this;
      controllers.onReady = function(){ self.init(options); };
      return;
    }

    this.options = options;
    this.config = options.config;
    this.routes = options.routes;

    this.setupRouter(options);
    this.setupControllers();
    this.router.startHistory();
    this.router.bindRoutes(this.routes);

    this.trigger("ready");
  },

  setupRouter: function(options){
    this.router = new Router(options.routes);
  },

  setupControllers: function(){
    var self = this;
    setTimeout(function(){
      var App = require("App");
      for(var controllerName in App.Controllers){
        if(controllerName === "AppController") continue;
        var controllerPrototype = App.Controllers[controllerName];
        var instanceName = controllerName.charAt(0).toLowerCase()+controllerName.slice(1);
        var controller = self[instanceName] = new controllerPrototype();
        controller.init && controller.init(self.options);
      }
    },0);
  }
});
