import("etherpad.log");
import("plugins.testplugin.hooks");
import("plugins.testplugin.static.js.main");


// YOURNAME:
// YOURCOMMENT
function testpluginInit() {
 this.hooks = ['serverStartup', 'serverShutdown', 'handlePath'];
 this.client = new main.testpluginInit();
 this.description = 'Test Plugin';
 this.serverStartup = hooks.serverStartup;
 this.serverShutdown = hooks.serverShutdown;
 this.handlePath = hooks.handlePath;
 this.install = install;
 this.uninstall = uninstall;
}


// YOURNAME:
// YOURCOMMENT
function install() {
 log.info("Installing testplugin");
}


// YOURNAME:
// YOURCOMMENT
function uninstall() {
 log.info("Uninstalling testplugin");
}

