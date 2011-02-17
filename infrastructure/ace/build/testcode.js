
// YOURNAME:
// YOURCOMMENT
function getTestCode() {
  var testCode = [
'/* appjet:version 0.1 */',

// YOURNAME:
// YOURCOMMENT
'(function(){',
'/*',
' * jQuery 1.2.1 - New Wave Javascript',
' *',
' * Copyright (c) 2007 John Resig (jquery.com)',
' * Dual licensed under the MIT (MIT-LICENSE.txt)',
' * and GPL (GPL-LICENSE.txt) licenses.',
' *',
' * $Date: 2007-09-16 23:42:06 -0400 (Sun, 16 Sep 2007) $',
' * $Rev: 3353 $',
' */',
'',
'// Map over jQuery in case of overwrite',
'if ( typeof jQuery != "undefined" )',
'	var _jQuery = jQuery;',
'',

// YOURNAME:
// YOURCOMMENT
'var jQuery = window.jQuery = function(selector, context) {',
'	// If the context is a namespace object, return a new object',
'	return this instanceof jQuery ?',
'		this.init(selector, context) :',
'		new jQuery(selector, context);',
'};',
'',
'// Map over the $ in case of overwrite',
'if ( typeof $ != "undefined" )',
'	var _$ = $;',
'	',
'// Map the jQuery namespace to the \'$\' one',
'window.$ = jQuery;',
'',
'var quickExpr = /^[^<]*(<(.|\s)+>)[^>]*$|^#(\w+)$/;'].join('\n');
  return testCode;
}
