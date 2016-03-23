"use strict";

window.onload = function(){
  var i, els, tag, tags = {
    body: "page",
    h1: "headline",
    p: "paragraph",
    a: "link",
    strong: "important",
    em: "emphasis",
    img: "image",
    ol: "list",
    li: "list-item"
  }
  for(tag in tags){
    els = document.querySelectorAll(tag);
    for(i = 0; i < els.length; i++){
      els[i].className = tags[tag];
    }
  }
}
