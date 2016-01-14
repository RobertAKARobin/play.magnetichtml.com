"use strict";
/*
This content is copyright 2015 by Robert Thomas. Please do not copy or re-use any portion of it without express permission. (Not to be a grump.)
*/
var tileFactory;
window.onload = function(){
  var frame = h.el("frame");
  var frameSource;
  var head = "", body = "", foot = "";
  var headDelim = "<!--body-->", footDelim = "<!--/body-->";

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
    var offsetTop = 0, tile
    h.ajax("GET", frameSource + ".html", {}, function(html){
      html = splitAlongBody(html);
      splitToTiles(html);
    });

    function splitAlongBody(html){
      var split;
      if(!new RegExp(headDelim).test(html)) return html;
      split = html.split(headDelim);
      head = split[0];
      body = split[1].split(footDelim);
      foot = body[1];
      body = body[0];
      return body;
    }

    function splitToTiles(html){
      h.each(TileFactory.splitHTML(html), function(line){
        h.each(line.tiles, function(value, t){
          tile = putTileInLine(tileFactory.create(value), line, t);
        });
        offsetTop += tileFactory.letter.height;
      });
      refreshFrame();
    }

    function putTileInLine(newTile, line, tileNum){
      if(tileNum === 0){
        newTile.setPosition("left", line.left * tileFactory.letter.width);
        newTile.setPosition("top", offsetTop);
      }else newTile.appendTo(tile);
      if(newTile.element.offsetTop > offsetTop){
        offsetTop = newTile.element.offsetTop;
      }
      return newTile;
    }
  }());

  (function setUpSaveButton(){
    var saveButton = h.el("saveButton");
    saveButton.addEventListener("click", function(){
      var body = tileFactory.getTilesText();
      updateMessage("Saving...");
      if(head) body = [head, headDelim, body, footDelim, foot];
      var postData = {
        sitehtml: body.join(""),
        sitename: h.el("sitename").value,
        password: h.el("password").value
      }
      h.ajax("POST", "/", postData, processPost);
    });

    function processPost(response){
      response = JSON.parse(response);
      console.log(response);
      if(response.success){
        updateMessage("Saved! :)");
        if(response.action == "create" || frameSource !== response.base){
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
    var whole = [head, text, foot];
    text = whole.join("");
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
