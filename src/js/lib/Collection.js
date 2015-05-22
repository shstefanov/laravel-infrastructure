var Backbone               = require("backbone");
var Class                  = require("./Class.js");

var BaseCollection         = Backbone.Collection.extend({
  model: require("./Model.js")
});

BaseCollection.__className = "Collection";
Class.Collection           = BaseCollection;
BaseCollection.extend      = Class.extend;
module.exports             = BaseCollection;
