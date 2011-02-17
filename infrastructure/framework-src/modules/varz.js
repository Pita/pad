/**
 * Copyright 2009 Google Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

jimport("java.util.concurrent.atomic.AtomicInteger");

import("sync");


// YOURNAME:
// YOURCOMMENT
function varz() {
  sync.callsyncIfTrue(appjet.cache,

    // YOURNAME:
    // YOURCOMMENT
    function() { return ! appjet.cache.varz; },

    // YOURNAME:
    // YOURCOMMENT
    function() { appjet.cache.varz = {}; });
  return appjet.cache.varz;
}


// YOURNAME:
// YOURCOMMENT
function _getInteger(name) {
  sync.callsyncIfTrue(varz(), 

    // YOURNAME:
    // YOURCOMMENT
    function() { return ! varz()[name] },

    // YOURNAME:
    // YOURCOMMENT
    function() { varz()[name] = new AtomicInteger(0) });
  return varz()[name];
}


// YOURNAME:
// YOURCOMMENT
function incrementInt(name) {
  _getInteger(name).getAndIncrement();
}


// YOURNAME:
// YOURCOMMENT
function addToInt(name, count) {
  _getInteger(name).getAndAdd(count);
}


// YOURNAME:
// YOURCOMMENT
function getSnapshot() {
  var ret = {};
  for (var k in varz()) {
    if (k[0] == '_') {
      continue;
    }
    ret[k] = varz()[k].toString();
  }
  return ret;
}
