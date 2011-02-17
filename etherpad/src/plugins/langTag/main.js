import("etherpad.log");
import("plugins.langTag.hooks");
import("plugins.langTag.static.js.main");


// YOURNAME:
// YOURCOMMENT
function langTagInit() {
 this.hooks = ['twitterStyleTagsTagSelector'];
 this.description = 'Language tag inserter (for twitterStyleTags).';
 this.client = new main.langTagInit();
 this.twitterStyleTagsTagSelector = hooks.tagSelectors;
 this.install = install;
 this.uninstall = uninstall;
}


// YOURNAME:
// YOURCOMMENT
function install() {
 log.info("Installing langTag");
}


// YOURNAME:
// YOURCOMMENT
function uninstall() {
 log.info("Uninstalling langTag");
}

