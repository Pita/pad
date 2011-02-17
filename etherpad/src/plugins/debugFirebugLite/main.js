import("etherpad.log");
import("plugins.debugFirebugLite.hooks");
import("plugins.debugFirebugLite.static.js.main");


// YOURNAME:
// YOURCOMMENT
function debugFirebugLiteInit() {
 this.hooks = ['handlePath'];
 this.description = 'Firebug Lite';
 this.client = new main.debugFirebugLiteInit();
 this.handlePath = hooks.handlePath;
 this.install = install;
 this.uninstall = uninstall;
}


// YOURNAME:
// YOURCOMMENT
function install() {
 log.info("Installing debugFirebugLite");
}


// YOURNAME:
// YOURCOMMENT
function uninstall() {
 log.info("Uninstalling debugFirebugLite");
}

