var _ = require("underscore");

function _encode(data) {
  var result = "";
  if (typeof data === "string") {
    result = data;
  } else {
    var e = encodeURIComponent;
    for (var k in data) {
      if (data.hasOwnProperty(k)) {
        result += '&' + e(k) + '=' + e(data[k]);
      }
    }
  }
  return result;
}

function new_xhr() {
  var xhr;
  if (window.XMLHttpRequest) {
    xhr = new XMLHttpRequest();
  } else if (window.ActiveXObject) {
    try {
      xhr = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
      xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }
  }
  return xhr;
}

function AjaxApi(options){
  this.endpoint       = options.endpoint       || "";
  this.defaultHeaders = options.defaultHeaders || {};
  this.timeout        = options.timeout        || 0;
}

AjaxApi.prototype.fork = function(options){
  var forkedOptions = _.extend({}, options, {
    endpoint: this.endpoint+options.endpoint,
    defaultHeaders: this.defaultHeaders,
    timeout: this.timeout
  });
  return new AjaxApi(forkedOptions);
};

AjaxApi.prototype.ajax = function(options, cb){
  var xhr, payload;
  var data       = options.data      || {};
  var headers    = options.headers   || {};
  var method     = options.method    || "GET";
  var url        = this.endpoint + options.url;
  var allHeaders = _.extend({}, this.defaultHeaders, headers);

  try{
    xhr = new_xhr();
  } 
  catch(e){
    return cb(e);
  }

  xhr.withCredentials = true;

  payload = _encode(data);
  if(method === "GET" && payload) {
    url += "?" + payload;
    payload = null;
  }
  

  xhr.open(method, url);

  for (var headerKey in allHeaders) {
    if (allHeaders.hasOwnProperty(headerKey)) {
      xhr.setRequestHeader(headerKey, allHeaders[headerKey]);
    }
  }


  var tid;
  if(this.timeout){
    tid = setTimeout(function(){
      xhr.abort();
      cb("Ajax request timeout", undefined, xhr);
    }, this.timeout);
  }

  xhr.onreadystatechange = function() {
    if (typeof tid !== "undefined"){
      clearTimeout(tid);
    }
    if (xhr.readyState === 4) {
      var response;
      try{
        response = JSON.parse(xhr.responseText);
      }
      catch(err){
        response = xhr.responseText;
      }
      var err = (!xhr.status||(xhr.status < 200 || xhr.status >= 300) && xhr.status !== 304);
      cb(err, response, xhr);
    }
  };

  xhr.send(payload);
  return this;
}

module.exports = AjaxApi;
