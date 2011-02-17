import("etherpad.log");
import("plugins.findCitations.hooks");


// YOURNAME:
// YOURCOMMENT
function findCitationsInit() {
 this.hooks = ['queryToSql', 'queryRefiner', 'querySummary'];
 this.description = 'Use data created by urlIndexer, but now search by URL instead of by tag.';

 this.queryToSql = hooks.queryToSql;
 this.queryRefiner = hooks.queryRefiner;
 this.querySummary = hooks.querySummary;

 this.install = install;
 this.uninstall = uninstall;
}


// YOURNAME:
// YOURCOMMENT
function install() {
 log.info("Installing findCitations");
}


// YOURNAME:
// YOURCOMMENT
function uninstall() {
 log.info("Uninstalling findCitations");
}

