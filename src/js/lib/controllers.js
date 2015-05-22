var App        = require("App");
var AjaxApi    = App.AjaxApi;
var config = require("config");

var controllers_api = new AjaxApi({
  endpoint:           "/"+config.infrastructure.name,
  defaultHeaders:     config.ajax_api? (config.ajax_api.defaultHeaders || {} ) : {},
  timeout:            config.ajax_api? (config.ajax_api.timeout        || {} ) : {}
});

// controllers_api.defaultHeaders["Accept"] = "application/json";


controllers_api.ajax({
  url:      "/_index",
  data:     {},
}, function(err, response, xhr){
  if(err) throw response;
  for(var key in response){
    controllers[key] = new Controller(key, response[key], controllers_api);

    window.controllers = controllers;
  }
});


function Controller(name, methods, api){
  var self = this;
  api.forEach(function(action){
    self[action] = function(){
      var args = Array.prototype.slice.call(arguments);
      var cb = args.pop();
      api.ajax({
        method: "POST",
        url:    "/_api",
        data: {
          controller: name,
          action:     action,
          body:       args
        }
      }, cb);
    }
  })
}


var controllers = module.exports = {};
