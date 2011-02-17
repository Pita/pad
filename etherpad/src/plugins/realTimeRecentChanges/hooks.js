import("etherpad.log");
import("dispatch.{Dispatcher,PrefixMatcher,forward}");
import("plugins.realTimeRecentChanges.controllers.rtrcBrowser");


// YOURNAME:
// YOURCOMMENT
function handlePath() {
  return [[PrefixMatcher('/ep/rtrc'), forward(rtrcBrowser)]];
}


// YOURNAME:
// YOURCOMMENT
function docbarItemsSearch() {
 return ["<td class='docbarbutton'><a href='/ep/rtrc/'>RTRC</a></td>"];
}

