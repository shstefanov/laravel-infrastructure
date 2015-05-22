var App        = require("App");
var AjaxApi    = App.AjaxApi;
var config = require("config");

console.log(config);

var controllers_api = new AjaxApi({
  endpoint:           "/"+config.infrastructure.name,
  defaultHeaders:     config.ajax_api? (config.ajax_api.defaultHeaders || {} ) : {},
  timeout:            config.ajax_api? (config.ajax_api.timeout        || 0 )  : 0
});

// controllers_api.defaultHeaders["Accept"] = "application/json";

controllers_api.ajax({
  url:      "/_index",
  data:     {},
}, function(err, response, xhr){
  if(err) throw response;
  for(var key in response){
    window.controllers = controllers;
    controllers[key] = new Controller(key, response[key], controllers_api);
  }

  controllers.__ready = true;
  if(controllers.onReady) controllers.onReady(); 
});


function Controller(name, methods, api){
  var self = this;
  methods.forEach(function(action){
    self[action] = function(){
      var args = Array.prototype.slice.call(arguments);
      var cb = args.pop();
      api.ajax({
        method: "POST",
        url:    "/_api",
        headers:{ 'Content-Type': 'application/x-www-form-urlencoded' },
        data: {
          controller: name,
          action:     action,
          body:       JSON.stringify(args)
        }
      }, cb);
    }
  })
}


var controllers = module.exports = {};
