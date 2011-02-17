import("etherpad.log");
import("faststatic");
import("etherpad.utils.*");
import("etherpad.globals.*");


// YOURNAME:
// YOURCOMMENT
function tagSelectors(arg) {
  return [arg.template.include('langTagTagSelectors.ejs', undefined, ['langTag'])];
}
