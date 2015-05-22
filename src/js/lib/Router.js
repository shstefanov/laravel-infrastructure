// Backbone router needs jQuery to select 'window' and to attach 2 events to it
// Creating simple mockup

var Backbone               = require("backbone");
var Class                  = require("./Class.js");

var jQueryMockup = {
  on: function(event, handler){
    this.el.addEventListener(event, handler);
    return jQueryMockup;
  },
  off: function(event, handler){
    this.el.removeEventListener(event, handler);
    return jQueryMockup;
  }
};

Backbone.$ = function(el){
  jQueryMockup.el = el;
  return jQueryMockup;
}

function getLink(elem){
  if(elem.nodeName === "A") return elem;
  else if(!elem.parentNode) return null;
  else return getLink(elem.parentNode);
}

function getHref(elem, rootPath){
  if(!elem) return false;
  var href = elem.getAttribute("href");
  if(elem.href && href.indexOf("/")===0) {
    return (rootPath === "") ? href.replace(/^\//, "") : rootPath+href;
  }
  return false;
}

var BaseRouter = Backbone.Router.extend({
  initialize: function(routes){
    this.routes = routes;
    var config  = require("config");
    var router  = this;
    var rootPath;
    if(config.router && config.router.rootPath){
      rootPath = config.router.rootPath.replace(/^\//, "");
    }
    else rootPath = "";
    document.body.addEventListener("click", function(e){
      var href = getHref(getLink(e.target), rootPath);
      if(href) {
        e.preventDefault();
        router.navigate(href, true);
      }
    });
  },

  startHistory: function(){
    Backbone.history.start({pushState: true});
  },

  back: function(n){
    Backbone.history.back(n || -1);
  },

  bindRoutes: function(){
    for(var routePath in this.routes){
      var routeName = this.routes[routePath];
      if(Array.isArray(routeName)){
        for(var i=0;i<routeName.length;i++){
          this.route(routePath.replace(/^\//,""), routeName[i]);
        }
      }
      else{
        this.route(routePath.replace(/^\//,""), routeName);
      }
    }
  }
});



BaseRouter.__className = "Router";
BaseRouter.extend      = Class.extend;
module.exports         = BaseRouter;



