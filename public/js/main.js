"use strict";
/*
This content is copyright 2015 by Robert Thomas. Please do not copy or re-use any portion of it without express permission. (Not to be a grump.)
*/
var tileFactory;
window.onload = function(){
  var frame = h.el("frame");
  var frameSource;
  var isLocal;
  var baseDir;
  var apiDir;

  (function isLocalHost(){
    if(location.host == "localhost"){
      baseDir = "http://localhost/magnetic/";
      apiDir = "http://localhost/magnetic/api/";
    }else{
      baseDir = "http://magnetichtml.com/";
      apiDir = "http://localhost:4567/";
    }
  }());

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
    frameSource = "/page/" + (location.pathname.substring(1) || "default") + ".html";
    h.el("sitename").value = "default";
    h.el("popout").href = "/page" + frameSource + ".html";
  }());

  (function loadTiles(){
    var offsetTop = 0;
    var tile;
    var lineLength;
    h.ajax("GET", frameSource, {}, function(html){
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
        sitename: el("sitename").value,
        password: el("password").value
      }
      ajax("POST", apiDir + "save.php", postData, function(response){
        response = JSON.parse(response);
        if(response.fail){
          updateMessage(response.fail);
        }else if(response.success == "updated"){
          updateMessage("Updated!");
        }else{
          window.location.replace(location.origin + location.pathname + "?url=" + response.success);
        }
      });
    });

    function updateMessage(content){
      var message = el("message");
      message.textContent = content;
      addClass(message, "err");
      setTimeout(function(){
        removeClass(message, "err");
      }, 2000);
    }
  }());

  // (function getCounter(){
  //   ajax("GET", apiDir + "counter.txt", {}, function(count){
  //     el("sitename").placeholder = "Give site #" + count + " a name";
  //   });
  // }());

  function refreshFrame(){
    var urlRegex = /(?:href=\s*"|src=\s*"|url\()(?!http)([^ "]+)/g;
    var text = tileFactory.getTilesText();
    text = text.replace(/[\n\r]/g, " ");
    text = text.replace(/\s{2,}/g, " ");
    text = text.replace(urlRegex, function(match, filename){
      var rel = match.substring(0, match.indexOf(filename));
      var output = rel.trim();
      output += apiDir;
      return output += filename.trim();
    });
    frame.srcdoc = text;
  }
}
