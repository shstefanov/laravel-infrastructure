var _ = require("underscore");

module.exports = {
  
  chain: function(fns, context){
    var self = this;
    fns = fns.map(function(f){
      if(typeof f !== "function") {
        var that = self;
        return function(){
          var ctx = this;
          var args = Array.prototype.slice.call(arguments);
          var chain_cb = args.pop();
          that.amap(f, function(ob_fn, amap_cb){
            ob_fn.apply(ctx, args.concat([amap_cb]));
          }, chain_cb);
        };
      }
      else{
        return f;
      }
    });


    return function(){
      var cb, ctx = context || this, ch = fns, ptr = -1;
      var args = Array.prototype.slice.call(arguments);
      var cb = args.pop();
      if(typeof cb !== "function") ctx = cb, cb = args.pop();
      if(typeof cb !== "function") throw new Error("Got you!!");
      if(fns.length){
        ptr++;
        args.push(next);
        fns[0].apply(ctx, args);
      }
      else{
        args.unshift(null);
        cb.apply(ctx, args);
      }
      function next(){
        var err = arguments[0];
        if(err) return cb(err);
        if(!ch[++ptr]) return cb.apply(ctx, arguments);
        try{ch[ptr].apply(ctx, Array.prototype.slice.call(arguments, 1).concat([next]));}
        catch(err){cb(err);}
      }
    }
  },

  runFnsIterator: function(fn, cb){fn(cb);},

  amapCompose: function(obj, iterator){
    var self = this;
    return function(ob, itr, cb){
      self.amap( ob||obj, itr||iterator, cb);
    }
  },

  amap: function(arr, iterator, cb){
    if(!iterator) iterator = this.runFnsIterator;
    else if(Array.isArray(iterator)) iterator = this.chain(iterator);
    var results, counter;
    if(!Array.isArray(arr)){
      results = {};
      counter = Object.keys(arr).length;
      arr.forEach = function(itr){
        for(var key in arr) {
          if(key==="forEach") continue;
          itr(arr[key], key, arr);
        }
      }
    }
    else{
      counter = arr.length;
      results = new Array(arr.length);
    }
    if(counter===0) return cb(null, arr);

    var  error;
    arr.forEach(function(el, idx, arr){
      setTimeout(function(){
        iterator(el, function(err, result){
          if(error === true) return;
          if(err){error = true; return cb(err);}
          results[idx] = result;
          counter--;
          if(counter===0) {
            cb(null, results);
          }
        });
      }, 0);
    });
    if(!Array.isArray(arr)) delete arr.forEach;
  },

  defaultize: function(base, target){
    if(Array.isArray(target)) target.forEach(function(t){_.defaults(t, base)});
    else{
      for(var key in target){
        _.defaults(target[key], base);
      }
    }
    return target;
  },

  instantiate: function(objects, Prototype){
    if(_.isArray(objects)){
      return objects.map(function(object){
        return new Prototype(object);
      });
    }
    else if(_.isObject(objects)){
      var result = {};
      for(var key in objects){
        result[key] = new Prototype(objects[key]);
      }
      return result;
    }
    else{
      return new Prototype(objects);
    }
  },

  deepExtend: function(target, source){
    for(var key in source){
      if(_.isObject(target[key]) && _.isObject(source[key])){
        helpers.deepExtend(target[key], source[key]);
      }
      else { target[key] = source[key]; }
    }
  }
  
};
