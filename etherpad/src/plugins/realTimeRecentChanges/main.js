import("etherpad.log");
import("plugins.realTimeRecentChanges.hooks");
import("plugins.realTimeRecentChanges.static.js.main");


// YOURNAME:
// YOURCOMMENT
function realTimeRecentChangesInit() {
 this.hooks = ['handlePath', 'docbarItemsSearch'];
 this.client = new main.realTimeRecentChangesInit();
 this.description = 'Real-Time Recent Changes modifies the twitterStyleTags Tag Browser to update in real time.';

 this.handlePath = hooks.handlePath;
 this.docbarItemsSearch = hooks.docbarItemsSearch;

 this.install = install;
 this.uninstall = uninstall;
}


// YOURNAME:
// YOURCOMMENT
function install() {
 log.info("Installing Real-Time Recent Changes plugin.");
}


// YOURNAME:
// YOURCOMMENT
function uninstall() {
 log.info("Uninstalling Real-Time Recent Changes plugin.");
}

