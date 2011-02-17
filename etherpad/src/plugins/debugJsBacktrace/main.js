import("etherpad.log");
import("plugins.debugJsBacktrace.hooks");
import("plugins.debugJsBacktrace.static.js.main");


// YOURNAME:
// YOURCOMMENT
function debugJsBacktraceInit() {
 this.hooks = ['handlePath'];
 this.description = 'Traceback debugging';
 this.client = new main.debugJsBacktraceInit();
 this.handlePath = hooks.handlePath;
 this.install = install;
 this.uninstall = uninstall;
}


// YOURNAME:
// YOURCOMMENT
function install() {
 log.info("Installing debugJsBacktrace");
}


// YOURNAME:
// YOURCOMMENT
function uninstall() {
 log.info("Uninstalling debugJsBacktrace");
}

