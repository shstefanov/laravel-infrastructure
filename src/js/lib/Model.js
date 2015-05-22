var Backbone          = require("backbone");
var Class             = require("./Class.js");
var config            = require("config"); 

var BaseModel         = Backbone.Model.extend({});

if(config.models && config.models.id_attribute){
  BaseModel.prototype.id_attribute = config.models.id_attribute;
}

BaseModel.__className = "Model";
BaseModel.extend      = Class.extend;
module.exports        = BaseModel;
