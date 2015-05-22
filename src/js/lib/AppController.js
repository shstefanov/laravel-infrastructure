var Controller = require("./Controller.js");
var Router     = require("./Router.js");

module.exports = Controller.extend("BaseAppController", {
  constructor: function(controllers, options){
    this.controllerPrototypes = controllers;
    this.options = options;
    this.router = new Router(options.routes);
    Controller.apply(this, arguments);
  },
  setupControllers: function(){
    for(var controllerName in this.controllerPrototypes){
      if(controllerName === "AppController") continue;
      var controllerPrototype = this.controllerPrototypes[controllerName];
      var instanceName = controllerName.charAt(0).toLowerCase()+controllerName.slice(1);
      this[instanceName] = new controllerPrototype(this.options);
    }
  }
});
