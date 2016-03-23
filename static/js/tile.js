"use strict";

function TileFactory(parent){
  var factory = this;
  factory.tiles = [];
  factory.element = parent;
  factory.getLetterDimensions();
  factory.isTouchy = "ontouchstart" in window ? true : false;
  factory.getEdges();
}
TileFactory.splitHTML = function(html){
  var output = [];
  var lines = html.split(/[\n\r]/g);
  h.each(lines, function(raw){
    var line = {left: raw.search(/\S|$/), tiles: []}
    var tiles = raw
      .replace(/\>/g, "> ")
      .replace(/;(?!n)/g, "; ")
      .replace(/=(?=["'])/g, "= ")
      .split(/(?=<)|(\s)|(?=&)/);
    h.each(tiles, function(tile){
      if(tile) tile = tile.trim();
      if(tile) line.tiles.push(tile);
    });
    output.push(line);
  });
  return output;
}
TileFactory.prototype = {
  getLetterDimensions: function(){
    var factory = this;
    var tester = document.createElement("SPAN");
    var styles;
    tester.style.minWidth = "0";
    tester.style.width = "auto";
    tester.style.padding = "0";
    tester.textContent = "A";
    factory.element.appendChild(tester);
    styles = window.getComputedStyle(tester);
    factory.letter = {
      width: parseFloat(styles.width),
      height: parseFloat(styles.height)
    }
    factory.element.removeChild(tester);
  },
  create: function(content){
    var factory = this;
    var tile = new Tile(factory);
    factory.element.appendChild(tile.element);
    tile.element.focus();
    tile.update(content || "");
    factory.latest = tile;
    factory.element.dispatchEvent(Tile.events.create);
    return tile;
  },
  destroy: function(tile){
    var factory = this;
    if(factory.element.children.length <= 1) return;
    var tiles = factory.getTilesSortedByLocation();
    var focuser = tiles[tiles.indexOf(tile.element) - 1];
    (focuser || tiles[1]).focus();
    factory.element.removeChild(tile.element);
  },
  getEdges: function(){
    var factory = this;
    var parent = factory.element;
    factory.edge = {
      right: parent.scrollLeft + parent.scrollWidth,
      bottom: parent.scrollTop + parent.scrollHeight
    }
  },
  getTilesSortedByLocation: function(){
    var factory = this;
    var tiles = Array.prototype.slice.call(factory.element.children);
    tiles.sort(function(a, b){
      if(a.offsetTop == b.offsetTop){
        return a.offsetLeft - b.offsetLeft;
      }else{
        return a.offsetTop - b.offsetTop;
      }
    });
    return tiles;
  },
  getTilesText: function(){
    var factory = this, lines = {}, output = [];
    var tiles = factory.getTilesSortedByLocation();
    h.each(tiles, function(tile){
      var indent, lineNum = tile.offsetTop / factory.letter.height;
      if(!lines[lineNum]){
        lines[lineNum] = []
        indent = Math.round(tile.offsetLeft / factory.letter.width);
        if(indent > 0) lines[lineNum].push(Array(indent).join(" "));
      }
      lines[lineNum].push(tile.value);
    });
    h.each(lines, function(line){
      output.push(line.join(" "));
    });
    output = h.stripUnnecessarySpaces(output.join("\n"));
    return output;
  }
}

function Tile(factory){
  var tile = this, el;
  tile.factory = factory;
  tile.element = el = document.createElement("TEXTAREA");
  el.setAttribute("spellcheck", "false");
  el.addEventListener("mousedown", tile.toggleFocus.bind(tile));
  el.addEventListener("touchstart", tile.toggleFocus.bind(tile));
  el.addEventListener("keydown", tile.onKeyDown.bind(tile));
  el.addEventListener("keypress", tile.onKeyPress.bind(tile));
  el.addEventListener("keyup", tile.onKeyUp.bind(tile));
  el.addEventListener("change", function(){
    tile.checkIfHTML();
    tile.factory.element.dispatchEvent(Tile.events.update);
  });
}
Tile.events = {
  create: h.defineEvent("tileCreate"),
  update: h.defineEvent("tileUpdate")
}
Tile.prototype = {
  calculateNewWidth: function(add){
    var tile = this, length;
    var factory = tile.factory;
    var text = tile.element.value;
    if(add) text = text + Array((add) + 1).join("_");
    tile.element.style.paddingLeft = factory.letter.width + "px";
    tile.element.style.paddingRight = factory.letter.width + "px";
    tile.element.style.width = (factory.letter.width * text.length) + "px";
  },
  destroy: function(){
    var tile = this;
    var factory = tile.factory;
  },
  update: function(text){
    var tile = this;
    tile.element.value = text;
    tile.checkIfHTML();
    tile.calculateNewWidth();
  },
  toggleFocus: function(evt){
    var tile = this;
    evt.preventDefault();
    if(!tile.tapped){
      tile.tapped = setTimeout(function(){
        tile.tapped = null;
      }, 300);
    }else{
      tile.element.focus();
      clearTimeout(tile.tapped);
      tile.tapped = null;
    }
  },
  onKeyDown: function(evt){
    var tile = this;
    var key = evt.keyCode;
    if(key == 8){
      if(tile.element.value.length < 1){
        evt.preventDefault();
        tile.factory.destroy(tile);
      }
      tile.calculateDeleteWidth = true;
    }else if(key == 13){
      evt.preventDefault();
      tile.factory.create().appendTo(tile);
    }
  },
  onKeyPress: function(evt){
    var tile = this;
    var element = tile.element;
    if(element.offsetWidth > tile.factory.element.scrollWidth - 10){
      evt.preventDefault();
    }else{
      tile.calculateNewWidth(1);
    }
    if((element.offsetLeft + element.offsetWidth) > tile.factory.edge.right){
      element.style.left = tile.factory.edge.right - element.offsetWidth + "px";
    }
  },
  onKeyUp: function(evt){
    var tile = this;
    if(tile.calculateDeleteWidth){
      tile.calculateNewWidth();
      tile.calculateDeleteWidth = false;
    }
  },
  checkIfHTML: function(){
    var tile = this;
    var isTag = new RegExp([
      "(<.*)",
      "(.*>)",
      "(^[a-z-]+=)"
    ].join("|"));
    var isSpecialChar = /(&#?[^;\s]+;)/;
    if(isTag.test(tile.element.value)) h.addClass(tile.element, "htmlTag");
    else h.removeClass(tile.element, "htmlTag");
    if(isSpecialChar.test(tile.element.value)) h.addClass(tile.element, "specialChar");
    else h.removeClass(tile.element, "specialChar");
  },
  setPosition: function(direction, distance){
    var tile = this;
    tile.element.style[direction] = distance + "px";
  },
  appendTo: function(base){
    var tile = this;
    var factory = tile.factory;
    var edge = {};
    if(!base){
      return tile;
    }else{
      base = base.element;
    }
    edge.top = base.offsetTop;
    edge.left = base.offsetLeft + base.offsetWidth;
    edge.bottom = edge.top + tile.element.offsetHeight;
    edge.right = edge.left + tile.element.offsetWidth;
    if(edge.right > factory.edge.right){
      edge.left = 0;
      edge.top = edge.bottom;
      if(edge.bottom > factory.edge.bottom){
        factory.element.style.height = factory.element.offsetHeight +  tile.element.offsetHeight;
      }
    }
    tile.element.style.top = edge.top + "px";
    tile.element.style.left = edge.left + "px";
    return tile;
  }
}
