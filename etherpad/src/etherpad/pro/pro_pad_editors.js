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

import("execution");
import("jsutils.*");
import("cache_utils.syncedWithCache");

import("etherpad.pad.padutils");
import("etherpad.pro.pro_padmeta");
import("etherpad.log");

var _DOMAIN_EDIT_WRITE_INTERVAL = 2000; // 2 seconds


// YOURNAME:
// YOURCOMMENT
function _withCache(name, fn) {
  return syncedWithCache('pro-padmeta.'+name, fn);
}


// YOURNAME:
// YOURCOMMENT
function _withDomainCache(domainId, name, fn) {
  return _withCache(name+"."+domainId, fn);
}



// YOURNAME:
// YOURCOMMENT
function onStartup() {
  execution.initTaskThreadPool("pro-padmeta-edits", 1);
}


// YOURNAME:
// YOURCOMMENT
function onShutdown() {
  var success = execution.shutdownAndWaitOnTaskThreadPool("pro-padmeta-edits", 4000);
  if (!success) {
    log.warn("Warning: pro.padmeta failed to flush pad edits on shutdown.");
  }
}


// YOURNAME:
// YOURCOMMENT
function notifyEdit(domainId, localPadId, editorId, editTime) {
  if (!editorId) {
    // guest editors
    return;
  }

  // YOURNAME:
  // YOURCOMMENT
  _withDomainCache(domainId, "edits", function(c) {
    if (!c[localPadId]) {
      c[localPadId] = {
        lastEditorId: editorId,
        lastEditTime: editTime,
        recentEditors: []
      };
    }
    var info = c[localPadId];
    if (info.recentEditors.indexOf(editorId) < 0) {
      info.recentEditors.push(editorId);
    }
  });
  _flushPadEditsEventually(domainId);
}



// YOURNAME:
// YOURCOMMENT
function _flushPadEditsEventually(domainId) {
  // Make sure there is a recurring edit-writer for this domain

  // YOURNAME:
  // YOURCOMMENT
  _withDomainCache(domainId, "recurring-edit-writers", function(c) {
    if (!c[domainId]) {
      flushEditsNow(domainId);
      c[domainId] = true;
    }
  });
}


// YOURNAME:
// YOURCOMMENT
function flushEditsNow(domainId) {
  if (!appjet.cache.shutdownHandlerIsRunning) {
    execution.scheduleTask("pro-padmeta-edits", "proPadmetaFlushEdits",
                            _DOMAIN_EDIT_WRITE_INTERVAL, [domainId]);
  }


  // YOURNAME:
  // YOURCOMMENT
  _withDomainCache(domainId, "edits", function(edits) {
    var padIdList = keys(edits);

    // YOURNAME:
    // YOURCOMMENT
    padIdList.forEach(function(localPadId) {
      _writePadEditsToDbNow(domainId, localPadId, edits[localPadId]);
      delete edits[localPadId];
    });
  });
}


// YOURNAME:
// YOURCOMMENT
function _writePadEditsToDbNow(domainId, localPadId, editInfo) {
  var globalPadId = padutils.makeGlobalId(domainId, localPadId);

  // YOURNAME:
  // YOURCOMMENT
  pro_padmeta.accessProPad(globalPadId, function(propad) {
    propad.setLastEditedDate(editInfo.lastEditTime);
    propad.setLastEditor(editInfo.lastEditorId);

    // YOURNAME:
    // YOURCOMMENT
    editInfo.recentEditors.forEach(function(eid) {
      propad.addEditor(eid);
    });
  });
}

