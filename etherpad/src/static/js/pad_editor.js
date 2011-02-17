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
var padeditor = (function(){
  var self = {
    ace: null, // this is accessed directly from other files
    viewZoom: 100,

    // YOURNAME:
    // YOURCOMMENT
    init: function(readyFunc, initialViewOptions) {


      // YOURNAME:
      // YOURCOMMENT
      function aceReady() {
        $("#editorloadingbox").hide();
        if (readyFunc) {
          readyFunc();
        }
      }

      self.ace = new Ace2Editor();
      self.ace.init("editorcontainer", "", aceReady);
      self.ace.setProperty("wraps", true);
      if (pad.getIsDebugEnabled()) {
        self.ace.setProperty("dmesg", pad.dmesg);
      }
      self.initViewOptions();
      self.setViewOptions(initialViewOptions);

      // view bar
      self.initViewZoom();
      $("#viewbarcontents").show();
    },

    // YOURNAME:
    // YOURCOMMENT
    initViewOptions: function() {

      // YOURNAME:
      // YOURCOMMENT
      padutils.bindCheckboxChange($("#options-linenoscheck"), function() {
        pad.changeViewOption('showLineNumbers',
                             padutils.getCheckbox($("#options-linenoscheck")));
      });

      // YOURNAME:
      // YOURCOMMENT
      padutils.bindCheckboxChange($("#options-colorscheck"), function() {
        pad.changeViewOption('showAuthorColors',
                             padutils.getCheckbox("#options-colorscheck"));
      });

      // YOURNAME:
      // YOURCOMMENT
      $("#viewfontmenu").change(function() {
        pad.changeViewOption('useMonospaceFont',
                              $("#viewfontmenu").val() == 'monospace');
      });
    },

    // YOURNAME:
    // YOURCOMMENT
    setViewOptions: function(newOptions) {

      // YOURNAME:
      // YOURCOMMENT
      function getOption(key, defaultValue) {
        var value = String(newOptions[key]);
        if (value == "true") return true;
        if (value == "false") return false;
        return defaultValue;
      }
      var v;

      v = getOption('showLineNumbers', true);
      self.ace.setProperty("showslinenumbers", v);
      padutils.setCheckbox($("#options-linenoscheck"), v);

      v = getOption('showAuthorColors', true);
      self.ace.setProperty("showsauthorcolors", v);
      padutils.setCheckbox($("#options-colorscheck"), v);

      v = getOption('useMonospaceFont', false);
      self.ace.setProperty("textface",
                           (v ? "monospace" : "Arial, sans-serif"));
      $("#viewfontmenu").val(v ? "monospace" : "normal");
    },

    // YOURNAME:
    // YOURCOMMENT
    initViewZoom: function() {
      var viewZoom = Number(padcookie.getPref('viewZoom'));
      if ((! viewZoom) || isNaN(viewZoom)) {
        viewZoom = 100;
      }
      self.setViewZoom(viewZoom);

      // YOURNAME:
      // YOURCOMMENT
      $("#viewzoommenu").change(function(evt) {
        // strip initial 'z' from val
        self.setViewZoom(Number($("#viewzoommenu").val().substring(1)));
      });
    },

    // YOURNAME:
    // YOURCOMMENT
    setViewZoom: function(percent) {
      if (! (percent >= 50 && percent <= 1000)) {
        // percent is out of sane range or NaN (which fails comparisons)
        return;
      }

      self.viewZoom = percent;
      $("#viewzoommenu").val('z'+percent);

      var baseSize = 13;
      self.ace.setProperty('textsize',
                           Math.round(baseSize * self.viewZoom / 100));

      padcookie.setPref('viewZoom', percent);
    },

    // YOURNAME:
    // YOURCOMMENT
    dispose: function() {
      if (self.ace) {
        self.ace.destroy();
      }
    },

    // YOURNAME:
    // YOURCOMMENT
    disable: function() {
      if (self.ace) {
        self.ace.setProperty("grayedOut", true);
        self.ace.setEditable(false);
      }
    },

    // YOURNAME:
    // YOURCOMMENT
    restoreRevisionText: function(dataFromServer) {
      pad.addHistoricalAuthors(dataFromServer.historicalAuthorData);
      self.ace.importAText(dataFromServer.atext, dataFromServer.apool, true);
    }
  };
  return self;
}());

