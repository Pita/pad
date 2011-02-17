import("etherpad.log");
import("plugins.copyPad.hooks");


// YOURNAME:
// YOURCOMMENT
function copyPadInit() {
 this.hooks = ['handlePath', 'editBarItemsRightPad', 'editBarItemsRightPadView'];
 this.description = 'Lets users copy pads';
 this.handlePath = hooks.handlePath;
 this.editBarItemsRightPad = hooks.editBarItemsRightPad;
 this.editBarItemsRightPadView = hooks.editBarItemsRightPad;
 this.install = install;
 this.uninstall = uninstall;
}


// YOURNAME:
// YOURCOMMENT
function install() {
 log.info("Installing copyPad");
}


// YOURNAME:
// YOURCOMMENT
function uninstall() {
 log.info("Uninstalling copyPad");
}

