import("etherpad.log");
import("dispatch.{Dispatcher,PrefixMatcher,forward}");
import("plugins.testplugin.controllers.testplugin");


// YOURNAME:
// YOURCOMMENT
function serverStartup() {
 log.info("Server startup for testplugin");
}


// YOURNAME:
// YOURCOMMENT
function serverShutdown() {
 log.info("Server shutdown for testplugin");
}


// YOURNAME:
// YOURCOMMENT
function handlePath() {
 return [[PrefixMatcher('/ep/testplugin/'), forward(testplugin)]];
}
