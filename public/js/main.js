"use strict";
/*
This content is copyright 2015 by Robert Thomas. Please do not copy or re-use any portion of it without express permission. (Not to be a grump.)
*/
var tileFactory;
window.onload = function(){
  var frame = h.el("frame");
  var frameSource;
  var isLocal;

  (function createTileFactory(){
    tileFactory = new TileFactory(h.el("create"));
    tileFactory.element.addEventListener("tileCreate", function(){
      var draggable = new Draggable(tileFactory.latest.element);
      draggable.element.addEventListener("drop", refreshFrame);
    });
    tileFactory.element.addEventListener("tileUpdate", function(){
      refreshFrame();
    });
  }());

  (function getSource(){
    frameSource = (location.pathname.substring(1) || "default");
    h.el("sitename").value = (frameSource == "default" ? "" : frameSource);
    h.el("popout").href = frameSource + ".html";
  }());

  (function loadTiles(){
    var offsetTop = 0;
    var tile;
    var lineLength;
    h.ajax("GET", frameSource + ".html", {}, function(html){
      var lines = TileFactory.splitHTML(html);
      h.each(lines, function(line, l){
        h.each(line.tiles, function(value, t){
          var newTile = tileFactory.create(value);
          if(t === 0){
            newTile.setPosition("left", line.left * tileFactory.letter.width);
            newTile.setPosition("top", offsetTop);
          }else newTile.appendTo(tile);
          if(newTile.element.offsetTop > offsetTop){
            offsetTop = newTile.element.offsetTop;
          }
          tile = newTile;
        });
        offsetTop = offsetTop + tileFactory.letter.height;
      });
      refreshFrame();
    });
  }());

  (function setUpSaveButton(){
    var saveButton = h.el("saveButton");
    saveButton.addEventListener("click", function(){
      updateMessage("Saving...");
      var postData = {
        sitehtml: tileFactory.getTilesText(),
        sitename: h.el("sitename").value,
        password: h.el("password").value
      }
      h.ajax("POST", "/", postData, processPost);
    });

    function processPost(response){
      response = JSON.parse(response);
      if(response.success){
        updateMessage("Saved! :)");
        if(response.action == "create"){
          window.location.replace(location.origin + "/" + response.base);
        }
      }else{
        updateMessage("Oops! Did you enter the right site name and password?");
      }
    }

    function updateMessage(content){
      var message = h.el("message");
      message.textContent = content;
      h.addClass(message, "err");
      setTimeout(function(){
        h.removeClass(message, "err");
      }, 2000);
    }
  }());

  function refreshFrame(){
    var urlRegex = /(?:href=\s*"|src=\s*"|url\()(?!http)([^ "]+)/g;
    var text = tileFactory.getTilesText();
    text = text.replace(/[\n\r]/g, " ");
    text = text.replace(/\s{2,}/g, " ");
    text = text.replace(urlRegex, function(match, filename){
      var rel = match.substring(0, match.indexOf(filename));
      var output = rel.trim();
      return output += filename.trim();
    });
    frame.srcdoc = text;
  }
}
