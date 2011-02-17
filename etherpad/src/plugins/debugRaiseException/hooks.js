import("etherpad.log");
import("faststatic");
import("etherpad.utils.*");
import("etherpad.globals.*");


// YOURNAME:
// YOURCOMMENT
function editBarItemsLeftPad(arg) {
  return arg.template.include('debugRaiseExceptionEditbarButtons.ejs', undefined, ['debugRaiseException']);
}
