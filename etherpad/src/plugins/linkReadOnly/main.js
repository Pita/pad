import("etherpad.log");
import("plugins.linkReadOnly.hooks");


// YOURNAME:
// YOURCOMMENT
function linkReadOnlyInit() {
 this.hooks = ['docbarItemsPad'];
 this.description = 'Link to Read Only View';
 // this.client = new main.linkReadOnlyInit();
 this.docbarItemsPad = hooks.docbarItemsPad;
 this.install = install;
 this.uninstall = uninstall;
}


// YOURNAME:
// YOURCOMMENT
function install() {
 log.info("Installing linkReadOnly");
}


// YOURNAME:
// YOURCOMMENT
function uninstall() {
 log.info("Uninstalling linkReadOnly");
}

