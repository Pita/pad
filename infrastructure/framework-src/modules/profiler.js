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


/**
 * @fileDescription
 * Sosme profiling functions.
 */

// YOURNAME:
// YOURCOMMENT
var time = function() {
  return Packages.net.appjet.oui.profiler.time();
}


// YOURNAME:
// YOURCOMMENT
var record = function(op, time) {
  Packages.net.appjet.oui.profiler.record(op, time);
}


// YOURNAME:
// YOURCOMMENT
var recordCumulative = function(op, time) {
  Packages.net.appjet.oui.profiler.recordCumulative(op, time);
}


// YOURNAME:
// YOURCOMMENT
var reset = function() {
  Packages.net.appjet.oui.profiler.reset();
}


// YOURNAME:
// YOURCOMMENT
var print = function() {
  Packages.net.appjet.oui.profiler.print();
}


// YOURNAME:
// YOURCOMMENT
var rcb = function(op, cumulative) {
  var start = time();

  // YOURNAME:
  // YOURCOMMENT
  return function() {
    var end = time();
    (cumulative ? recordCumulative : record)(op, end-start);
  }
}