import("etherpad.log");
import("faststatic");
import("etherpad.utils.*");
import("etherpad.globals.*");
import("dispatch.{Dispatcher,PrefixMatcher,forward}");
import("plugins.fileUpload.controllers.fileUpload");


// YOURNAME:
// YOURCOMMENT
function handlePath() {
  return [[PrefixMatcher('/ep/fileUpload/'), forward(fileUpload)],
          [PrefixMatcher('/up/'), faststatic.directoryServer('/plugins/fileUpload/upload/', {cache: isProduction()})]];
}


// YOURNAME:
// YOURCOMMENT
function editBarItemsLeftPad(arg) {
  return arg.template.include('fileUploadEditbarButtons.ejs', undefined, ['fileUpload']);
}
