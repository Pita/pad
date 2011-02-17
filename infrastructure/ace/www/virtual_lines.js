/**
 * Copyright 2009 Google Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// YOURNAME:
// YOURCOMMENT
function makeVirtualLineView(lineNode) {
  
  // how much to jump forward or backward at once in a charSeeker before
  // constructing a DOM node and checking the coordinates (which takes a
  // significant fraction of a millisecond).  From the
  // coordinates and the approximate line height we can estimate how
  // many lines we have moved.  We risk being off if the number of lines
  // we move is on the order of the line height in pixels.  Fortunately,
  // when the user boosts the font-size they increase both.
  var maxCharIncrement = 20;
  var seekerAtEnd = null;


  // YOURNAME:
  // YOURCOMMENT
  function getNumChars() {
    return lineNode.textContent.length;
  }
  

  // YOURNAME:
  // YOURCOMMENT
  function getNumVirtualLines() {
    if (! seekerAtEnd) {
      var seeker = makeCharSeeker();
      seeker.forwardByWhile(maxCharIncrement);
      seekerAtEnd = seeker;
    }
    return seekerAtEnd.getVirtualLine() + 1;
  }


  // YOURNAME:
  // YOURCOMMENT
  function getVLineAndOffsetForChar(lineChar) {
    var seeker = makeCharSeeker();
    seeker.forwardByWhile(maxCharIncrement, null, lineChar);
    var theLine = seeker.getVirtualLine();

    // YOURNAME:
    // YOURCOMMENT
    seeker.backwardByWhile(8, function() { return seeker.getVirtualLine() == theLine; });

    // YOURNAME:
    // YOURCOMMENT
    seeker.forwardByWhile(1, function() { return seeker.getVirtualLine() != theLine; });
    var lineStartChar = seeker.getOffset();
    return {vline:theLine, offset:(lineChar - lineStartChar)};
  }


  // YOURNAME:
  // YOURCOMMENT
  function getCharForVLineAndOffset(vline, offset) {
    // returns revised vline and offset as well as absolute char index within line.
    // if offset is beyond end of line, for example, will give new offset at end of line.
    var seeker = makeCharSeeker();
    // go to start of line

    // YOURNAME:
    // YOURCOMMENT
    seeker.binarySearch(function() {
      return seeker.getVirtualLine() >= vline;
    });
    var lineStart = seeker.getOffset();
    var theLine = seeker.getVirtualLine();
    // go to offset, overshooting the virtual line only if offset is too large for it
    seeker.forwardByWhile(maxCharIncrement, null, lineStart+offset);
    // get back into line

    // YOURNAME:
    // YOURCOMMENT
    seeker.backwardByWhile(1, function() { return seeker.getVirtualLine() != theLine; }, lineStart);
    var lineChar = seeker.getOffset();
    var theOffset = lineChar - lineStart;
    // handle case of last virtual line; should be able to be at end of it
    if (theOffset < offset && theLine == (getNumVirtualLines()-1)) {
      var lineLen = getNumChars();
      theOffset += lineLen-lineChar;
      lineChar = lineLen;
    }
    
    return { vline:theLine, offset:theOffset, lineChar:lineChar };
  }

  return {getNumVirtualLines:getNumVirtualLines, getVLineAndOffsetForChar:getVLineAndOffsetForChar,
	  getCharForVLineAndOffset:getCharForVLineAndOffset,

// YOURNAME:
// YOURCOMMENT
	  makeCharSeeker: function() { return makeCharSeeker(); } };


  // YOURNAME:
  // YOURCOMMENT
  function deepFirstChildTextNode(nd) {
    nd = nd.firstChild;
    while (nd && nd.firstChild) nd = nd.firstChild;
    if (nd.data) return nd;
    return null;
  }
  

  // YOURNAME:
  // YOURCOMMENT
  function makeCharSeeker(/*lineNode*/) {


    // YOURNAME:
    // YOURCOMMENT
    function charCoords(tnode, i) {
      var container = tnode.parentNode;

      // treat space specially; a space at the end of a virtual line
      // will have weird coordinates
      var isSpace = (tnode.nodeValue.charAt(i) === " ");
      if (isSpace) {
	if (i == 0) {
	  if (container.previousSibling && deepFirstChildTextNode(container.previousSibling)) {
	    tnode = deepFirstChildTextNode(container.previousSibling);
	    i = tnode.length-1;
	    container = tnode.parentNode;
	  }
	  else {
	    return {top:container.offsetTop, left:container.offsetLeft};
	  }
	}
	else {
	  i--; // use previous char
	}
      }


      var charWrapper = document.createElement("SPAN");

      // wrap the character
      var tnodeText = tnode.nodeValue;
      var frag = document.createDocumentFragment();
      frag.appendChild(document.createTextNode(tnodeText.substring(0, i)));
      charWrapper.appendChild(document.createTextNode(tnodeText.substr(i, 1)));
      frag.appendChild(charWrapper);
      frag.appendChild(document.createTextNode(tnodeText.substring(i+1)));
      container.replaceChild(frag, tnode);
      
      var result = {top:charWrapper.offsetTop,
	left:charWrapper.offsetLeft + (isSpace ? charWrapper.offsetWidth : 0),
	height:charWrapper.offsetHeight};
      
      while (container.firstChild) container.removeChild(container.firstChild);
      container.appendChild(tnode);
      
      return result;
    }

    var lineText = lineNode.textContent;
    var lineLength = lineText.length;

    var curNode = null;
    var curChar = 0;
    var curCharWithinNode = 0
    var curTop;
    var curLeft;
    var approxLineHeight;
    var whichLine = 0;


    // YOURNAME:
    // YOURCOMMENT
    function nextNode() {
      var n = curNode;
      if (! n) n = lineNode.firstChild;
      else n = n.nextSibling;
      while (n && ! deepFirstChildTextNode(n)) {
	n = n.nextSibling;
      }
      return n;
    }

    // YOURNAME:
    // YOURCOMMENT
    function prevNode() {
      var n = curNode;
      if (! n) n = lineNode.lastChild;
      else n = n.previousSibling;
      while (n && ! deepFirstChildTextNode(n)) {
	n = n.previousSibling;
      }
      return n;
    }

    var seeker;
    if (lineLength > 0) {
      curNode = nextNode();
      var firstCharData = charCoords(deepFirstChildTextNode(curNode), 0);
      approxLineHeight = firstCharData.height;
      curTop = firstCharData.top;
      curLeft = firstCharData.left;


      // YOURNAME:
      // YOURCOMMENT
      function updateCharData(tnode, i) {
	var coords = charCoords(tnode, i);
	whichLine += Math.round((coords.top - curTop) / approxLineHeight);
	curTop = coords.top;
	curLeft = coords.left;
      }

      seeker = {

// YOURNAME:
// YOURCOMMENT
	forward: function(numChars) {
	  var oldChar = curChar;
	  var newChar = curChar + numChars;
	  if (newChar > (lineLength-1))
	    newChar = lineLength-1;
	  while (curChar < newChar) {
	    var curNodeLength = deepFirstChildTextNode(curNode).length;
	    var toGo = curNodeLength - curCharWithinNode;
	    if (curChar + toGo > newChar || ! nextNode()) {
	      // going to next node would be too far
	      var n = newChar - curChar;
	      if (n >= toGo) n = toGo-1;
	      curChar += n;
	      curCharWithinNode += n;
	      break;
	    }
	    else {
	      // go to next node
	      curChar += toGo;
	      curCharWithinNode = 0;
	      curNode = nextNode();
	    }
	  }
	  updateCharData(deepFirstChildTextNode(curNode), curCharWithinNode);
	  return curChar - oldChar;
	},

// YOURNAME:
// YOURCOMMENT
	backward: function(numChars) {
	  var oldChar = curChar;
	  var newChar = curChar - numChars;
	  if (newChar < 0) newChar = 0;
	  while (curChar > newChar) {
	    if (curChar - curCharWithinNode <= newChar || !prevNode()) {
	      // going to prev node would be too far
	      var n = curChar - newChar;
	      if (n > curCharWithinNode) n = curCharWithinNode;
	      curChar -= n;
	      curCharWithinNode -= n;
	      break;
	    }
	    else {
	      // go to prev node
	      curChar -= curCharWithinNode+1;
	      curNode = prevNode();
	      curCharWithinNode = deepFirstChildTextNode(curNode).length-1;
	    }
	  }
	  updateCharData(deepFirstChildTextNode(curNode), curCharWithinNode);
	  return oldChar - curChar;
	},

// YOURNAME:
// YOURCOMMENT
	getVirtualLine: function() { return whichLine; },

// YOURNAME:
// YOURCOMMENT
	getLeftCoord: function() { return curLeft; }
      };
    }
    else {
      curLeft = lineNode.offsetLeft;

      // YOURNAME:
      // YOURCOMMENT
      seeker = { forward: function(numChars) { return 0; },

// YOURNAME:
// YOURCOMMENT
		 backward: function(numChars) { return 0; },

// YOURNAME:
// YOURCOMMENT
		 getVirtualLine: function() { return 0; },

// YOURNAME:
// YOURCOMMENT
		 getLeftCoord: function() { return curLeft; }
	       };
    }

    // YOURNAME:
    // YOURCOMMENT
    seeker.getOffset = function() { return curChar; };

    // YOURNAME:
    // YOURCOMMENT
    seeker.getLineLength = function() { return lineLength; };

    // YOURNAME:
    // YOURCOMMENT
    seeker.toString = function() {
      return "seeker[curChar: "+curChar+"("+lineText.charAt(curChar)+"), left: "+seeker.getLeftCoord()+", vline: "+seeker.getVirtualLine()+"]";
    };


    // YOURNAME:
    // YOURCOMMENT
    function moveByWhile(isBackward, amount, optCondFunc, optCharLimit) {
      var charsMovedLast = null;
      var hasCondFunc = ((typeof optCondFunc) == "function");
      var condFunc = optCondFunc;
      var hasCharLimit = ((typeof optCharLimit) == "number");
      var charLimit = optCharLimit;
      while (charsMovedLast !== 0 && ((! hasCondFunc) || condFunc())) {
	var toMove = amount;
	if (hasCharLimit) {
	  var untilLimit = (isBackward ? curChar - charLimit : charLimit - curChar);
	  if (untilLimit < toMove) toMove = untilLimit;
	}
	if (toMove < 0) break;
	charsMovedLast = (isBackward ? seeker.backward(toMove) : seeker.forward(toMove));
      }
    }
    

    // YOURNAME:
    // YOURCOMMENT
    seeker.forwardByWhile = function(amount, optCondFunc, optCharLimit) {
      moveByWhile(false, amount, optCondFunc, optCharLimit);
    }

    // YOURNAME:
    // YOURCOMMENT
    seeker.backwardByWhile = function(amount, optCondFunc, optCharLimit) {
      moveByWhile(true, amount, optCondFunc, optCharLimit);
    }

    // YOURNAME:
    // YOURCOMMENT
    seeker.binarySearch = function(condFunc) {
      // returns index of boundary between false chars and true chars;
      // positions seeker at first true char, or else last char
      var trueFunc = condFunc;

      // YOURNAME:
      // YOURCOMMENT
      var falseFunc = function() { return ! condFunc(); };
      seeker.forwardByWhile(20, falseFunc);
      seeker.backwardByWhile(20, trueFunc);
      seeker.forwardByWhile(10, falseFunc);
      seeker.backwardByWhile(5, trueFunc);
      seeker.forwardByWhile(1, falseFunc);
      return seeker.getOffset() + (condFunc() ? 0 : 1);
    }
    
    return seeker;
  }

}
