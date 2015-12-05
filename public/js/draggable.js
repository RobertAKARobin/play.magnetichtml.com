function Draggable(element){
  var instance = this;
  instance.isDragging = false;
  instance.element = element;
  instance.element.style.position = "absolute";
  instance.isTouchy = "ontouchstart" in window ? true : false;
  instance.parent = instance.element.parentElement;
  // Have to do this here, instead of .bind in the addEventListener
  // Otherwise can't removeEventListener
  instance.drag = instance.drag.bind(instance);
  instance.drop = instance.drop.bind(instance);
  if(instance.isTouchy){
    instance.element.addEventListener("touchstart",
    instance.startDragging.bind(instance));
  }else{
    instance.element.addEventListener("mousedown",
    instance.startDragging.bind(instance));
  }
};
Draggable.events = {
  drop: h.defineEvent("drop")
}
Draggable.prototype = {
  startDragging: function(evt){
    var instance = this, startEvent, endEvent;
    if(instance.isDragging){
      return;
    }else{
      instance.isDragging = true;
    }
    var evt = instance.isTouchy ? evt.touches[0] : evt;
    instance.getStartingPositions(evt);
    startEvent = instance.isTouchy ? "touchmove" : "mousemove";
    endEvent = instance.isTouchy ? "touchend" : "mouseup";
    window.addEventListener(startEvent, instance.drag);
    window.addEventListener(endEvent, instance.drop);
  },
  drag: function(evt){
    var instance = this;
    evt.preventDefault();
    var evt = evt.type == "touchmove" ? evt.touches[0] : evt;
    var newTop = instance.getNewPosition("top", evt);
    var newLeft = instance.getNewPosition("left", evt);
    instance.element.style.top = newTop + "px";
    instance.element.style.left = newLeft + "px";
  },
  drop: function(evt){
    var instance = this;
    instance.isDragging = false;
    window.removeEventListener("touchmove", instance.drag);
    window.removeEventListener("touchend", instance.drop);
    window.removeEventListener("mousemove", instance.drag);
    window.removeEventListener("mouseup", instance.drop);
    instance.snapToGrid();
    if(instance.startingCursor.left != evt.clientX
    || instance.startingCursor.top != evt.clientY){
      instance.element.dispatchEvent(Draggable.events.drop);
    }
  },
  getStartingPositions: function(evt){
    var instance = this;
    var element = instance.element;
    var offsetParent = element.offsetParent;
    var overlapX = (element.offsetWidth / 2);
    var overlapY = (element.offsetHeight / 2);
    instance.startingPosition = {
      top: element.offsetTop,
      left: element.offsetLeft
    }
    instance.startingCursor = {
      top: evt.clientY,
      left: evt.clientX
    }
    instance.maxPosition = {
      top: offsetParent.scrollHeight - element.offsetHeight + overlapY,
      left: offsetParent.scrollWidth - element.offsetWidth + overlapX
    }
    instance.minPosition = {
      top: 0 - overlapY,
      left: 0 - overlapX
    }
  },
  getNewPosition: function(direction, evt){
    var instance = this;
    var axis = (direction == "top") ? "Y" : "X";
    var cursorChange = evt["client" + axis] - instance.startingCursor[direction];
    var elementPos = instance.startingPosition[direction] + cursorChange;
    var maxPos = instance.maxPosition[direction];
    var minPos = instance.minPosition[direction];
    if(elementPos > maxPos){
      return maxPos;
    }else if(elementPos < minPos){
      return minPos;
    }else{
      return elementPos;
    }
  },
  snapToGrid: function(){
    var instance = this;
    var element = instance.element;
    var proportion = element.offsetTop / element.offsetHeight;
    var output = Math.round(proportion) * element.offsetHeight;
    var bottomEdge = output + element.offsetHeight;
    if(bottomEdge > instance.parent.scrollHeight){
      output = bottomEdge - (2 * element.offsetHeight);
    }else if(output < 0){
      output = 0;
    }
    element.style.top = output + "px";
  },
};
