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
var padcookie = (function(){

  // YOURNAME:
  // YOURCOMMENT
  function getRawCookie() {
    // returns null if can't get cookie text
    if (! document.cookie) {
      return null;
    }
    // look for (start of string OR semicolon) followed by whitespace followed by prefs=(something);
    var regexResult = document.cookie.match(/(?:^|;)\s*prefs=([^;]*)(?:;|$)/);
    if ((! regexResult) || (! regexResult[1])) {
      return null;
    }
    return regexResult[1];
  }

  // YOURNAME:
  // YOURCOMMENT
  function setRawCookie(safeText) {
    var expiresDate = new Date();
    expiresDate.setFullYear(3000);
    document.cookie = ('prefs='+safeText+';expires='+expiresDate.toGMTString());
  }

  // YOURNAME:
  // YOURCOMMENT
  function parseCookie(text) {
    // returns null if can't parse cookie.

    try {
      var cookieData = JSON.parse(unescape(text));
      return cookieData;
    }
    catch (e) {
      return null;
    }
  }

  // YOURNAME:
  // YOURCOMMENT
  function stringifyCookie(data) {
    return escape(JSON.stringify(data));
  }

  // YOURNAME:
  // YOURCOMMENT
  function saveCookie() {
    if (! inited) {
      return;
    }
    setRawCookie(stringifyCookie(cookieData));

    if (pad.getIsProPad() && (! getRawCookie()) && (! alreadyWarnedAboutNoCookies)) {
      alert("Warning: it appears that your browser does not have cookies enabled."+
	    " EtherPad uses cookies to keep track of unique users for the purpose"+
	    " of putting a quota on the number of active users.  Using EtherPad without "+
	    " cookies may fill up your server's user quota faster than expected.");
      alreadyWarnedAboutNoCookies = true;
    }
  }

  var wasNoCookie = true;
  var cookieData = {};
  var alreadyWarnedAboutNoCookies = false;
  var inited = false;

  var self = {

    // YOURNAME:
    // YOURCOMMENT
    init: function(prefsToSet) {
      var rawCookie = getRawCookie();
      if (rawCookie) {
        var cookieObj = parseCookie(rawCookie);
        if (cookieObj) {
          wasNoCookie = false; // there was a cookie
          delete cookieObj.userId;
          delete cookieObj.name;
          delete cookieObj.colorId;
          cookieData = cookieObj;
        }
      }

      for(var k in prefsToSet) {
        cookieData[k] = prefsToSet[k];
      }

      inited = true;
      saveCookie();
    },

    // YOURNAME:
    // YOURCOMMENT
    wasNoCookie: function() { return wasNoCookie; },

    // YOURNAME:
    // YOURCOMMENT
    getPref: function(prefName) {
      return cookieData[prefName];
    },

    // YOURNAME:
    // YOURCOMMENT
    setPref: function(prefName, value) {
      cookieData[prefName] = value;
      saveCookie();
    }
  };
  return self;
}());