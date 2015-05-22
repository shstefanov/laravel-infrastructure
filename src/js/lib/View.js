var _          = require("underscore");
var Ractive    = require("ractive/ractive.runtime.js" );

var config     = require("config");
if(config.ractive) Ractive.DEBUG = config.ractive.debug;

module.exports = Ractive.extend({

  oninit: function() {
    this.bindModelsAndCollections();
    if(this.initialize) { this.initialize(); }
  },

  bindModelsAndCollections: function(){
    var self = this;

    if(this.bindModels){
      this.cachedModelListeners = {};
      this.bindModels.forEach(function(keypath){
        var model = self.get(keypath);
        model && self.bindModelChange(keypath, model);
        self.observe(keypath, function(newModel, oldModel, keypath){
          if(newModel !== oldModel){
            oldModel && this.unbindModelChange(keypath, oldModel);
            newModel && this.bindModelChange  (keypath, newModel);
          }
        });
      });
    }

    if(this.bindCollections){
      this.cachedCollectionListeners = {};
      this.bindCollections.forEach(function(keypath){
        var collection = self.get(keypath);
        collection && self.bindCollectionEvents(keypath, collection);
        self.observe(keypath, function(newCollection, oldCollection, keypath){
          if(newCollection !== oldCollection){
            oldCollection && this.unbindCollectionEvents(keypath, oldCollection);
            newCollection && this.bindCollectionEvents  (keypath, newCollection);
          }
        });
      });
    }
  },

  toggle: function(path){
    var paths = Array.prototype.slice.call(arguments);
    for(var i=0;i<paths.length;i++){
      this.set(paths[i], !this.get(paths[i]));
    }
  },

  bindModelChange: function(keypath, model){
    if(!this.cachedModelListeners[keypath]){
      this.cachedModelListeners[keypath] = function(model){
        if(!model){ return; }
        var changed = model.changedAttributes();
        for(var attrName in changed){
          this.set(keypath+".attributes."+attrName, changed[attrName]);
        }
      }
    }
    model.on("change", this.cachedModelListeners[keypath], this);
  },

  unbindModelChange: function(keypath, model){
    model.off("change", this.cachedModelListeners[keypath], this);
  },

  bindCollectionEvents: function(keypath, collection){
    if(!this.cachedCollectionListeners[keypath]){
      this.cachedCollectionListeners[keypath] = {
        change: function(model){
          collection = this.get(keypath);
          if(!collection) return;
          var index = collection.models.indexOf(model);
          var modelPath = keypath+".models["+index+"].attributes.";
          var changed = model.changedAttributes();
          for(var attrName in changed){
            this.set(modelPath+attrName, changed[attrName]);
          }
        },
        reset: function(){
          this.set(keypath, this.get(keypath));
        }
      }

    }
    collection.on("change", this.cachedCollectionListeners[keypath].change, this);
    collection.on("reset",  this.cachedCollectionListeners[keypath].reset,  this);
  },

  unbindCollectionEvents: function(keypath, collection){
    collection.off("change", this.cachedCollectionListeners[keypath].change, this);
    collection.off("reset",  this.cachedCollectionListeners[keypath].reset,  this);
  },

  fetch: function(obj){
    var result = {};
    for(var key in obj) {
      var target = obj[key];
      if(target.indexOf("*")){
        var parts = target.split(/[.\[]\*[.\]]/);
        var targetObj = this.get(parts[0]);
        if(!target[1]){
          result[key] = targetObj;
        }
        else if(_.isArray(targetObj)){
          result[key] = new Array(targetObj.length);
          for(var i=0;i<targetObj.length;i++){
            result[key][i] = this.get(target.replace("*", i));
          }
        }
        else if(_.isObject(targetObj)){
          result[key] = {};
          for(var targetKey in targetObj){
            result[key][targetKey] = this.get(target.replace("*", targetKey));
          }
        }
        else{
          result[key] = targetObj;
        }
      }
      else{
        result[key] = this.get(target);
      }
    }
    return result;
  },

  radioToggle: function(path){
    var parts      = path.split(".");
    var parentPath = parts.slice(0,-1).join(".");
    var target     = parts.slice(-1).pop();
    var parent     = this.get(parentPath);
    var current    = parent.__current;
    if(current){
      this.toggle(parentPath+"."+current);
    }
    if(target === current){
      parent.__current = null;
      return;
    }
    else{
      parent.__current = target;
      this.toggle(path);
    }
  }



});
