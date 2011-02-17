import("etherpad.log");
import("plugins.licenseTag.hooks");
import("plugins.licenseTag.static.js.main");


// YOURNAME:
// YOURCOMMENT
function licenseTagInit() {
 this.hooks = ['twitterStyleTagsTagSelector'];
 this.description = 'License tag inserter (for twitterStyleTags).';
 this.client = new main.licenseTagInit();
 this.twitterStyleTagsTagSelector = hooks.tagSelectors;
 this.install = install;
 this.uninstall = uninstall;
}


// YOURNAME:
// YOURCOMMENT
function install() {
 log.info("Installing licenseTag");
}


// YOURNAME:
// YOURCOMMENT
function uninstall() {
 log.info("Uninstalling licenseTag");
}

