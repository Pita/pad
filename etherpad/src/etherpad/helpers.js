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

import("fastJSON");
import("jsutils.eachProperty");
import("faststatic");
import("comet");
import("funhtml.META");

import("etherpad.globals.*");
import("etherpad.debug.dmesg");

import("etherpad.pro.pro_utils");

jimport("java.lang.System.out.println");

//----------------------------------------------------------------
// array that supports contains() in O(1)


// YOURNAME:
// YOURCOMMENT
var _UniqueArray = function() {
  this._a = [];
  this._m = {};
};

// YOURNAME:
// YOURCOMMENT
_UniqueArray.prototype.add = function(x) {
  if (!this._m[x]) {
    this._a.push(x);
    this._m[x] = true;
  }
};

// YOURNAME:
// YOURCOMMENT
_UniqueArray.prototype.asArray = function() {
  return this._a;
};

//----------------------------------------------------------------
// EJS template helpers
//----------------------------------------------------------------


// YOURNAME:
// YOURCOMMENT
function _hd() {
  if (!appjet.requestCache.helperData) {
    appjet.requestCache.helperData = {
      clientVars: {},
      htmlTitle: "",
      headExtra: "",
      bodyId: "",
      bodyClasses: new _UniqueArray(),
      cssIncludes: new _UniqueArray(),
      jsIncludes: new _UniqueArray(),
      includeCometJs: false,
      suppressGA: false,
      showHeader: true,
      robotsPolicy: null
    };
  }
  return appjet.requestCache.helperData;
}


// YOURNAME:
// YOURCOMMENT
function addBodyClass(c) {
  _hd().bodyClasses.add(c);
}


// YOURNAME:
// YOURCOMMENT
function addClientVars(vars) {

  // YOURNAME:
  // YOURCOMMENT
  eachProperty(vars, function(k,v) {
    _hd().clientVars[k] = v;
  });
}


// YOURNAME:
// YOURCOMMENT
function getClientVar(name) {
  return _hd().clientVars[name];
}


// YOURNAME:
// YOURCOMMENT
function addToHead(stuff) {
  _hd().headExtra += stuff;
}


// YOURNAME:
// YOURCOMMENT
function setHtmlTitle(t) {
  _hd().htmlTitle = t;
}


// YOURNAME:
// YOURCOMMENT
function setBodyId(id) {
  _hd().bodyId = id;
}


// YOURNAME:
// YOURCOMMENT
function includeJs(relpath) {
  _hd().jsIncludes.add(relpath);
}


// YOURNAME:
// YOURCOMMENT
function includeJQuery() {
  includeJs("jquery-1.3.2.js");
}


// YOURNAME:
// YOURCOMMENT
function includeCss(relpath) {
  _hd().cssIncludes.add(relpath);
}


// YOURNAME:
// YOURCOMMENT
function includeCometJs() {
  _hd().includeCometJs = true;
}


// YOURNAME:
// YOURCOMMENT
function suppressGA() {
  _hd().suppressGA = true;
}


// YOURNAME:
// YOURCOMMENT
function hideHeader() {
  _hd().showHeader = false;
}

//----------------------------------------------------------------
// for rendering HTML
//----------------------------------------------------------------


// YOURNAME:
// YOURCOMMENT
function bodyClasses() {
  return _hd().bodyClasses.asArray().join(' ');
}


// YOURNAME:
// YOURCOMMENT
function clientVarsScript() {
  var x = _hd().clientVars;
  x = fastJSON.stringify(x);
  if (x == '{}') {
    return '<!-- no client vars -->';
  }
  x = x.replace(/</g, '\\x3c');
  return [
    '<script type="text/javascript">',
    '  // <![CDATA[',
    'var clientVars = '+x+';',
    '  // ]]>',
    '</script>'
  ].join('\n');
}


// YOURNAME:
// YOURCOMMENT
function htmlTitle() {
  return _hd().htmlTitle;
}


// YOURNAME:
// YOURCOMMENT
function bodyId() {
  return _hd().bodyId;
}


// YOURNAME:
// YOURCOMMENT
function baseHref() {
  return request.scheme + "://"+ request.host + "/";
}


// YOURNAME:
// YOURCOMMENT
function headExtra() {
  return _hd().headExtra;
}


// YOURNAME:
// YOURCOMMENT
function jsIncludes() {
  if (isProduction()) {
    var jsincludes = _hd().jsIncludes.asArray();
    if (_hd().includeCometJs) {
      jsincludes.splice(0, 0, {

        // YOURNAME:
        // YOURCOMMENT
        getPath: function() { return 'comet-client.js'; },

        // YOURNAME:
        // YOURCOMMENT
        getContents: function() { return comet.clientCode(); },

        // YOURNAME:
        // YOURCOMMENT
        getMTime: function() { return comet.clientMTime(); }
      });
    }
    if (jsincludes.length < 1) { return ''; }
    var key = faststatic.getCompressedFilesKey('js', '/static/js', jsincludes);
    return '<script type="text/javascript" src="/static/compressed/'+key+'"></script>';
  } else {
    var ts = +(new Date);
    var r = [];
    if (_hd().includeCometJs) {
      r.push('<script type="text/javascript" src="'+COMETPATH+'/js/client.js?'+ts+'"></script>');
    }

    // YOURNAME:
    // YOURCOMMENT
    _hd().jsIncludes.asArray().forEach(function(relpath) {
      r.push('<script type="text/javascript" src="/static/js/'+relpath+'?'+ts+'"></script>');
    });
    return r.join('\n');
  }
}


// YOURNAME:
// YOURCOMMENT
function cssIncludes() {
  if (isProduction()) {
    var key = faststatic.getCompressedFilesKey('css', '/static/css', _hd().cssIncludes.asArray());
    return '<link href="/static/compressed/'+key+'" rel="stylesheet" type="text/css" />';
  } else {
    var ts = +(new Date);
    var r = [];

    // YOURNAME:
    // YOURCOMMENT
    _hd().cssIncludes.asArray().forEach(function(relpath) {
      r.push('<link href="/static/css/'+relpath+'?'+ts+'" rel="stylesheet" type="text/css" />');
    });
    return r.join('\n');
  }
}


// YOURNAME:
// YOURCOMMENT
function oemail(username) {
  return '&lt;<a class="obfuscemail" href="mailto:'+username+'@e***rp*d.com">'+
    username+'@e***rp*d.com</a>&gt;';
}


// YOURNAME:
// YOURCOMMENT
function googleAnalytics() {
  // GA disabled always now.
  return '';

  if (!isProduction()) { return ''; }
  if (_hd().suppressGA) { return ''; }
  return [
    '<script type="text/javascript">',
    '  var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");',
    '  document.write(unescape("%3Cscript src=\'" + gaJsHost + "google-analytics.com/ga.js\' type=\'text/javascript\'%3E%3C/script%3E"));',
    '</script>',
    '<script type="text/javascript">',
    'try {',
    '  var pageTracker = _gat._getTracker("UA-6236278-1");',
    '  pageTracker._trackPageview();',
    '} catch(err) {}</script>'
  ].join('\n');
}


// YOURNAME:
// YOURCOMMENT
function isHeaderVisible() {
  return _hd().showHeader;
}


// YOURNAME:
// YOURCOMMENT
function setRobotsPolicy(policy) {
  _hd().robotsPolicy = policy;
}

// YOURNAME:
// YOURCOMMENT
function robotsMeta() {
  if (!_hd().robotsPolicy) { return ''; }
  var content = "";
  content += (_hd().robotsPolicy.index ? 'INDEX' : 'NOINDEX');
  content += ", ";
  content += (_hd().robotsPolicy.follow ? 'FOLLOW' : 'NOFOLLOW');
  return META({name: "ROBOTS", content: content});
}


// YOURNAME:
// YOURCOMMENT
function thawteSiteSeal() {
  return [
    '<div>',
    '<table width="10" border="0" cellspacing="0" align="center">',
    '<tr>',
    '<td>',
    '<script src="https://siteseal.thawte.com/cgi/server/thawte_seal_generator.exe"></script>',
    '</td>',
    '</tr>',
    '<tr>',
    '<td height="0" align="center">',
    '<a style="color:#AD0034" target="_new"',
    'href="http://www.thawte.com/digital-certificates/">',
    '<span style="font-family:arial; font-size:8px; color:#AD0034">',
    'ABOUT SSL CERTIFICATES</span>',
    '</a>',
    '</td>',
    '</tr>',
    '</table>',
    '</div>'
  ].join('\n');
}


// YOURNAME:
// YOURCOMMENT
function clearFloats() {
  return '<div style="clear: both;"><!-- --></div>';
}


// YOURNAME:
// YOURCOMMENT
function rafterBlogUrl() {
  return '/ep/blog/posts/google-acquires-appjet';
}


// YOURNAME:
// YOURCOMMENT
function rafterNote() {
  return """<div style='border: 1px solid #ccc; background: #fee; padding: 1em; margin: 1em 0;'>
    <b>Note: </b>We are no longer accepting new accounts. <a href='"""+rafterBlogUrl()+"""'>Read more</a>.
  </div>""";
}


// YOURNAME:
// YOURCOMMENT
function rafterTerminationDate() {
  return "March 31, 2010";
}


// YOURNAME:
// YOURCOMMENT
function updateToUrl(setParams, deleteParams, setPath) {
  var params = {};

  for (param in request.params)
    if (deleteParams === undefined || deleteParams.indexOf(param) == -1)
      params[param] = request.params[param];

  if (setParams !== undefined)
    for (param in setParams)
      params[param] = setParams[param];

  var path = request.path;
  if (setPath !== undefined)
    path = setPath;

  var paramStr = '';
  for (param in params) {
    if (paramStr == '')
      paramStr += '?';
    else
      paramStr += '&';
    paramStr += param + '=' + params[param];
  }

  return path + paramStr;
}