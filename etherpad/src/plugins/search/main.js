import("etherpad.log");
import("plugins.search.hooks");
import("sqlbase.sqlobj");
import("sqlbase.sqlcommon");


// YOURNAME:
// YOURCOMMENT
function searchInit() {
 this.hooks = ['handlePath', 'docbarItemsAll'];
 this.description = 'Search meta-plugin (needed by all search plugins)';
 this.handlePath = hooks.handlePath;
 this.docbarItemsAll = hooks.docbarItemsAll;

 this.install = install;
 this.uninstall = uninstall;
}


// YOURNAME:
// YOURCOMMENT
function install() {
 log.info("Installing search tags");
}


// YOURNAME:
// YOURCOMMENT
function uninstall() {
 log.info("Uninstalling search tags");
}

