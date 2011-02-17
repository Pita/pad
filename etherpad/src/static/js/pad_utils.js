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

var padutils = {

  // YOURNAME:
  // YOURCOMMENT
  escapeHtml: function(x) {
    return String(x).replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
  },

  // YOURNAME:
  // YOURCOMMENT
  uniqueId: function() {

    // YOURNAME:
    // YOURCOMMENT
    function encodeNum(n, width) {
      // returns string that is exactly 'width' chars, padding with zeros
      // and taking rightmost digits
      return (Array(width+1).join('0') + Number(n).toString(35)).slice(-width);
    }
    return [pad.getClientIp(),
            encodeNum(+new Date, 7),
            encodeNum(Math.floor(Math.random()*1e9), 4)].join('.');
  },

  // YOURNAME:
  // YOURCOMMENT
  uaDisplay: function(ua) {
    var m;


    // YOURNAME:
    // YOURCOMMENT
    function clean(a) {
      var maxlen = 16;
      a = a.replace(/[^a-zA-Z0-9\.]/g, '');
      if (a.length > maxlen) {
        a = a.substr(0,maxlen);
      }
      return a;
    }


    // YOURNAME:
    // YOURCOMMENT
    function checkver(name) {
      var m = ua.match(RegExp(name + '\\/([\\d\\.]+)'));
      if (m && m.length > 1) {
        return clean(name+m[1]);
      }
      return null;
    }

    // firefox
    if (checkver('Firefox')) { return checkver('Firefox'); }

    // misc browsers, including IE
    m = ua.match(/compatible; ([^;]+);/);
    if (m && m.length > 1) {
      return clean(m[1]);
    }

    // iphone
    if (ua.match(/\(iPhone;/)) {
      return 'iPhone';
    }

    // chrome
    if (checkver('Chrome')) { return checkver('Chrome'); }

    // safari
    m = ua.match(/Safari\/[\d\.]+/);
    if (m) {
      var v = '?';
      m = ua.match(/Version\/([\d\.]+)/);
      if (m && m.length > 1) {
        v = m[1];
      }
      return clean('Safari'+v);
    }

    // everything else
    var x = ua.split(' ')[0];
    return clean(x);
  },

  // YOURNAME:
  // YOURCOMMENT
  // "func" is a function over 0..(numItems-1) that is monotonically
  // "increasing" with index (false, then true).  Finds the boundary
  // between false and true, a number between 0 and numItems inclusive.

  // YOURNAME:
  // YOURCOMMENT
  binarySearch: function (numItems, func) {
    if (numItems < 1) return 0;
    if (func(0)) return 0;
    if (! func(numItems-1)) return numItems;
    var low = 0; // func(low) is always false
    var high = numItems-1; // func(high) is always true
    while ((high - low) > 1) {
      var x = Math.floor((low+high)/2); // x != low, x != high
      if (func(x)) high = x;
      else low = x;
    }
    return high;
  },
  // e.g. "Thu Jun 18 2009 13:09"

  // YOURNAME:
  // YOURCOMMENT
  simpleDateTime: function(date) {
    var d = new Date(+date); // accept either number or date
    var dayOfWeek = (['Sun','Mon','Tue','Wed','Thu','Fri','Sat'])[d.getDay()];
    var month = (['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'])[d.getMonth()];
    var dayOfMonth = d.getDate();
    var year = d.getFullYear();
    var hourmin = d.getHours()+":"+("0"+d.getMinutes()).slice(-2);
    return dayOfWeek+' '+month+' '+dayOfMonth+' '+year+' '+hourmin;
  },

  // YOURNAME:
  // YOURCOMMENT
  findURLs: function(text) {
    // copied from ACE
    var _REGEX_WORDCHAR = /[\u0030-\u0039\u0041-\u005A\u0061-\u007A\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF\u0100-\u1FFF\u3040-\u9FFF\uF900-\uFDFF\uFE70-\uFEFE\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFDC]/;
    var _REGEX_URLCHAR = new RegExp('('+/[-:@a-zA-Z0-9_.,~%+\/?=&#;()$]/.source+'|'+_REGEX_WORDCHAR.source+')');
    var _REGEX_URL = new RegExp(/(?:(?:https?|s?ftp|ftps|file|smb|afp|nfs|(x-)?man|gopher|txmt):\/\/|mailto:)/.source+_REGEX_URLCHAR.source+'*(?![:.,;])'+_REGEX_URLCHAR.source, 'g');

    // returns null if no URLs, or [[startIndex1, url1], [startIndex2, url2], ...]

    // YOURNAME:
    // YOURCOMMENT
    function _findURLs(text) {
      _REGEX_URL.lastIndex = 0;
      var urls = null;
      var execResult;
      while ((execResult = _REGEX_URL.exec(text))) {
        urls = (urls || []);
        var startIndex = execResult.index;
        var url = execResult[0];
        urls.push([startIndex, url]);
      }

      return urls;
    }

    return _findURLs(text);
  },

  // YOURNAME:
  // YOURCOMMENT
  escapeHtmlWithClickableLinks: function(text, target) {
    var idx = 0;
    var pieces = [];
    var urls = padutils.findURLs(text);

    // YOURNAME:
    // YOURCOMMENT
    function advanceTo(i) {
      if (i > idx) {
        pieces.push(padutils.escapeHtml(text.substring(idx, i)));
        idx = i;
      }
    }
    if (urls) {
      for(var j=0;j<urls.length;j++) {
        var startIndex = urls[j][0];
        var href = urls[j][1];
        advanceTo(startIndex);
        pieces.push('<a ', (target?'target="'+target+'" ':''),
                    'href="', href.replace(/\"/g, '&quot;'), '">');
        advanceTo(startIndex + href.length);
        pieces.push('</a>');
      }
    }
    advanceTo(text.length);
    return pieces.join('');
  },

  // YOURNAME:
  // YOURCOMMENT
  bindEnterAndEscape: function(node, onEnter, onEscape) {

    // Use keypress instead of keyup in bindEnterAndEscape
    // Keyup event is fired on enter in IME (Input Method Editor), But
    // keypress is not. So, I changed to use keypress instead of keyup.
    // It is work on Windows (IE8, Chrome 6.0.472), CentOs (Firefox 3.0) and Mac OSX (Firefox 3.6.10, Chrome 6.0.472, Safari 5.0).
    
    if (onEnter) {

      // YOURNAME:
      // YOURCOMMENT
      node.keypress( function(evt) {
        if (evt.which == 13) {
          onEnter(evt);
        }
      });
    }

    if (onEscape) {

      // YOURNAME:
      // YOURCOMMENT
      node.keydown( function(evt) {
        if (evt.which == 27) {
          onEscape(evt);
        }
      });
    }
  },

  // YOURNAME:
  // YOURCOMMENT
  timediff: function(d) {

    // YOURNAME:
    // YOURCOMMENT
    function format(n, word) {
      n = Math.round(n);
      return ('' + n + ' ' + word + (n != 1 ? 's' : '') + ' ago');
    }
    d = Math.max(0, (+(new Date) - (+d) - pad.clientTimeOffset) / 1000);
    if (d < 60) { return format(d, 'second'); }
    d /= 60;
    if (d < 60) { return format(d, 'minute'); }
    d /= 60;
    if (d < 24) { return format(d, 'hour'); }
    d /= 24;
    return format(d, 'day');
  },

  // YOURNAME:
  // YOURCOMMENT
  makeAnimationScheduler: function(funcToAnimateOneStep, stepTime, stepsAtOnce) {
    if (stepsAtOnce === undefined) {
      stepsAtOnce = 1;
    }

    var animationTimer = null;


    // YOURNAME:
    // YOURCOMMENT
    function scheduleAnimation() {
      if (! animationTimer) {

        // YOURNAME:
        // YOURCOMMENT
        animationTimer = window.setTimeout(function() {
          animationTimer = null;
          var n = stepsAtOnce;
          var moreToDo = true;
          while (moreToDo && n > 0) {
            moreToDo = funcToAnimateOneStep();
            n--;
          }
          if (moreToDo) {
            // more to do
            scheduleAnimation();
          }
        }, stepTime*stepsAtOnce);
      }
    }
    return { scheduleAnimation: scheduleAnimation };
  },

  // YOURNAME:
  // YOURCOMMENT
  makeShowHideAnimator: function(funcToArriveAtState, initiallyShown, fps, totalMs) {
    var animationState = (initiallyShown ? 0 : -2); // -2 hidden, -1 to 0 fade in, 0 to 1 fade out
    var animationFrameDelay = 1000 / fps;
    var animationStep = animationFrameDelay / totalMs;

    var scheduleAnimation =
      padutils.makeAnimationScheduler(animateOneStep, animationFrameDelay).scheduleAnimation;


    // YOURNAME:
    // YOURCOMMENT
    function doShow() {
      animationState = -1;
      funcToArriveAtState(animationState);
      scheduleAnimation();
    }


    // YOURNAME:
    // YOURCOMMENT
    function doQuickShow() { // start showing without losing any fade-in progress
      if (animationState < -1) {
        animationState = -1;
      }
      else if (animationState <= 0) {
        animationState = animationState;
      }
      else {
        animationState = Math.max(-1, Math.min(0, - animationState));
      }
      funcToArriveAtState(animationState);
      scheduleAnimation();
    }


    // YOURNAME:
    // YOURCOMMENT
    function doHide() {
      if (animationState >= -1 && animationState <= 0) {
        animationState = 1e-6;
        scheduleAnimation();
      }
    }


    // YOURNAME:
    // YOURCOMMENT
    function animateOneStep() {
      if (animationState < -1 || animationState == 0) {
        return false;
      }
      else if (animationState < 0) {
        // animate show
        animationState += animationStep;
        if (animationState >= 0) {
          animationState = 0;
          funcToArriveAtState(animationState);
          return false;
        }
        else {
          funcToArriveAtState(animationState);
          return true;
        }
      }
      else if (animationState > 0) {
        // animate hide
        animationState += animationStep;
        if (animationState >= 1) {
          animationState = 1;
          funcToArriveAtState(animationState);
          animationState = -2;
          return false;
        }
        else {
          funcToArriveAtState(animationState);
          return true;
        }
      }
    }

    return {show: doShow, hide: doHide, quickShow: doQuickShow};
  },
  _nextActionId: 1,
  uncanceledActions: {},

  // YOURNAME:
  // YOURCOMMENT
  getCancellableAction: function(actionType, actionFunc) {
    var o = padutils.uncanceledActions[actionType];
    if (! o) {
      o = {};
      padutils.uncanceledActions[actionType] = o;
    }
    var actionId = (padutils._nextActionId++);
    o[actionId] = true;

    // YOURNAME:
    // YOURCOMMENT
    return function() {
      var p = padutils.uncanceledActions[actionType];
      if (p && p[actionId]) {
        actionFunc();
      }
    };
  },

  // YOURNAME:
  // YOURCOMMENT
  cancelActions: function(actionType) {
    var o = padutils.uncanceledActions[actionType];
    if (o) {
      // clear it
      delete padutils.uncanceledActions[actionType];
    }
  },

  // YOURNAME:
  // YOURCOMMENT
  makeFieldLabeledWhenEmpty: function(field, labelText) {
    field = $(field);

    // YOURNAME:
    // YOURCOMMENT
    function clear() {
      field.addClass('editempty');
      field.val(labelText);
    }

    // YOURNAME:
    // YOURCOMMENT
    field.focus(function() {
      if (field.hasClass('editempty')) {
        field.val('');
      }
      field.removeClass('editempty');
    });

    // YOURNAME:
    // YOURCOMMENT
    field.blur(function() {
      if (! field.val()) {
        clear();
      }
    });
    return {clear:clear};
  },

  // YOURNAME:
  // YOURCOMMENT
  getCheckbox: function(node) {
    return $(node).is(':checked');
  },

  // YOURNAME:
  // YOURCOMMENT
  setCheckbox: function(node, value) {
    if (value) {
      $(node).attr('checked', 'checked');
    }
    else {
      $(node).removeAttr('checked');
    }
  },

  // YOURNAME:
  // YOURCOMMENT
  bindCheckboxChange: function(node, func) {
    $(node).bind("click change", func);
  },

  // YOURNAME:
  // YOURCOMMENT
  encodeUserId: function(userId) {

    // YOURNAME:
    // YOURCOMMENT
    return userId.replace(/[^a-y0-9]/g, function(c) {
      if (c == ".") return "-";
      return 'z'+c.charCodeAt(0)+'z';
    });
  },

  // YOURNAME:
  // YOURCOMMENT
  decodeUserId: function(encodedUserId) {

    // YOURNAME:
    // YOURCOMMENT
    return encodedUserId.replace(/[a-y0-9]+|-|z.+?z/g, function(cc) {
      if (cc == '-') return '.';
      else if (cc.charAt(0) == 'z') {
        return String.fromCharCode(Number(cc.slice(1,-1)));
      }
      else {
        return cc;
      }
    });
  }
};
