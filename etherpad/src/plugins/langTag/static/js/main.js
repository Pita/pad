
// YOURNAME:
// YOURCOMMENT
function langTagInit() {
  this.hooks = [];
  this.langTagClicked = langTagClicked;
  this.langTagSelectLangClicked = langTagSelectLangClicked;
}


// YOURNAME:
// YOURCOMMENT
function langTagClicked () {
  $('#langTag-language-selector').toggle();
}


// YOURNAME:
// YOURCOMMENT
function langTagSelectLangClicked(lang) {
  padeditor.ace.replaceRange(undefined, undefined, " #lang:" + lang + " ");
  padeditor.ace.focus();
  $('#langTag-language-selector').toggle();
}


/* used on the client side only */
langTag = new langTagInit();
