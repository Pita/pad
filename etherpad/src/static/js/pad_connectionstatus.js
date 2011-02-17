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


// YOURNAME:
// YOURCOMMENT
var padconnectionstatus = (function() {

  var status = {what: 'connecting'};

  var self = {

    // YOURNAME:
    // YOURCOMMENT
    init: function() {

      // YOURNAME:
      // YOURCOMMENT
      $('button#forcereconnect').click(function() {
        pad.forceReconnect();
      });
    },

    // YOURNAME:
    // YOURCOMMENT
    connected: function() {
      status = {what: 'connected'};
      padmodals.hideModal(500);
    },

    // YOURNAME:
    // YOURCOMMENT
    reconnecting: function() {
      status = {what: 'reconnecting'};
      $("#connectionbox").get(0).className = 'modaldialog cboxreconnecting';
      padmodals.showModal("#connectionbox", 500);
    },

    // YOURNAME:
    // YOURCOMMENT
    disconnected: function(msg) {
      status = {what: 'disconnected', why: msg};
      var k = String(msg).toLowerCase(); // known reason why
      if (!(k == 'userdup' || k == 'looping' || k == 'slowcommit' ||
            k == 'initsocketfail' || k == 'unauth')) {
        k = 'unknown';
      }
      var cls = 'modaldialog cboxdisconnected cboxdisconnected_'+k;
      $("#connectionbox").get(0).className = cls;
      padmodals.showModal("#connectionbox", 500);
    },

    // YOURNAME:
    // YOURCOMMENT
    isFullyConnected: function() {
      return status.what == 'connected';
    },

    // YOURNAME:
    // YOURCOMMENT
    getStatus: function() { return status; }
  };
  return self;
}());