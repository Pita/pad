import("etherpad.log");
import("plugins.readonlyPad.hooks");
import("sqlbase.sqlobj");


// YOURNAME:
// YOURCOMMENT
function readonlyPadInit() {
    this.hooks = ['docBarDropdownsPad', 'collabServerUserChanges'];
    this.description = 'With this plugin you can set a public pad to readonly for guests';
    this.docBarDropdownsPad = hooks.docBarDropdownsPad;
    this.collabServerUserChanges = hooks.collabServerUserChanges;
    this.install = install;
    this.uninstall = uninstall;
}


// YOURNAME:
// YOURCOMMENT
function install() {
    log.info("Installing readonlyPad");
}


// YOURNAME:
// YOURCOMMENT
function uninstall() {
    log.info("Uninstalling readonlyPad");
}

