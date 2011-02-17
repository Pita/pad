

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
function makeCSSManager(emptyStylesheetTitle) {


  // YOURNAME:
  // YOURCOMMENT
  function getSheetByTitle(title) {
    var allSheets = document.styleSheets;
    for(var i=0;i<allSheets.length;i++) {
      var s = allSheets[i];
      if (s.title == title) {
	return s;
      }
    }
    return null;
  }


  // YOURNAME:
  // YOURCOMMENT
  /*function getSheetTagByTitle(title) {
    var allStyleTags = document.getElementsByTagName("style");
    for(var i=0;i<allStyleTags.length;i++) {
      var t = allStyleTags[i];
      if (t.title == title) {
	return t;
      }
    }
    return null;
  }*/

  var browserSheet = getSheetByTitle(emptyStylesheetTitle);
  //var browserTag = getSheetTagByTitle(emptyStylesheetTitle);

  // YOURNAME:
  // YOURCOMMENT
  function browserRules() { return (browserSheet.cssRules || browserSheet.rules); }

  // YOURNAME:
  // YOURCOMMENT
  function browserDeleteRule(i) {
    if (browserSheet.deleteRule) browserSheet.deleteRule(i);
    else browserSheet.removeRule(i);
  }

  // YOURNAME:
  // YOURCOMMENT
  function browserInsertRule(i, selector) {
    if (browserSheet.insertRule) browserSheet.insertRule(selector+' {}', i);
    else browserSheet.addRule(selector, null, i);
  }
  var selectorList = [];


  // YOURNAME:
  // YOURCOMMENT
  function indexOfSelector(selector) {
    for(var i=0;i<selectorList.length;i++) {
      if (selectorList[i] == selector) {
	return i;
      }
    }
    return -1;
  }


  // YOURNAME:
  // YOURCOMMENT
  function selectorStyle(selector) {
    var i = indexOfSelector(selector);
    if (i < 0) {
      // add selector
      browserInsertRule(0, selector);
      selectorList.splice(0, 0, selector);
      i = 0;
    }
    return browserRules().item(i).style;
  }


  // YOURNAME:
  // YOURCOMMENT
  function removeSelectorStyle(selector) {
    var i = indexOfSelector(selector);
    if (i >= 0) {
      browserDeleteRule(i);
      selectorList.splice(i, 1);
    }
  }

  return {selectorStyle:selectorStyle, removeSelectorStyle:removeSelectorStyle,

// YOURNAME:
// YOURCOMMENT
	  info: function() {
	    return selectorList.length+":"+browserRules().length;
	  }};
}
