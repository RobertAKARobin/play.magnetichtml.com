"use strict";

var h = (function(){
  var h = {};
  h.el = function(id){
    return document.getElementById(id);
  }
  h.toggleClass = function(element, className){
    if(element.className.indexOf(clazz) < 0) element.addClass(className);
    else element.removeClass(className);
  }
  h.removeClass = function(element, className){
    element.className = element.className.replace(className, "");
  }
  h.addClass = function(element, className){
    element.className += " " + className;
  }
  h.each = function(object, callback){
    var i = -1, l = object.length;
    if(Array.isArray(object)){
      while(++i < l){
        callback(object[i], i);
      }
    }else{
      for(i in object){
        callback(object[i], i);
      }
    }
  }
  h.defineEvent = function(name){
    var evt = document.createEvent("Event");
    evt.initEvent(name, true, true);
    return evt;
  }
  h.ajax = function(method, url, input, callback){
    var request = new XMLHttpRequest();
    request.open(method, url, true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.onreadystatechange = function(){
      var state = request.readyState;
      var code = request.status;
      var data = request.responseText;
      if(state == 4 && code >= 200 && code < 400) callback(data);
    }
    if(input){
      input = h.objectToQuery(input);
    }
    request.send(input);
  }

  h.objectToQuery = function(input){
    var output = [];
    h.each(input, function(param, key){
      output.push([key, encodeURIComponent(param)].join("="));
    });
    return output.join("&");
  }
  h.stripUnnecessarySpaces = function(input){
    var unnecessarySpaces = /(> (?=<))|(href=\s)|(src=\s)|( (?=&))/g;
    input = input.replace(unnecessarySpaces, function(match){
      var result = match.substring(0, match.length - 1);
      return result;
    });
    return input;
  }
  return h;
}());
