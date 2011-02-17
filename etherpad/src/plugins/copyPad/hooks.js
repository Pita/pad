import("etherpad.log");
import("faststatic");
import("etherpad.utils.*");
import("etherpad.globals.*");
import("dispatch.{Dispatcher,PrefixMatcher,forward}");
import("plugins.copyPad.controllers.copyPad");


// YOURNAME:
// YOURCOMMENT
function handlePath() {
  return [[PrefixMatcher('/ep/copyPad'), forward(copyPad)]];
}


// YOURNAME:
// YOURCOMMENT
function editBarItemsRightPad(arg) {
  return arg.template.include('copyPadEditbarButtons.ejs', undefined, ['copyPad']);
}
