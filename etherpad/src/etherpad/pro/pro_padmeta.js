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

import("stringutils");
import("cache_utils.syncedWithCache");
import("sync");

import("etherpad.pad.padutils");
import("etherpad.pro.pro_pad_db");


// YOURNAME:
// YOURCOMMENT
function _doWithProPadLock(domainId, localPadId, func) {
  var lockName = ["pro-pad", domainId, localPadId].join("/");
  return sync.doWithStringLock(lockName, func);
}


// YOURNAME:
// YOURCOMMENT
function accessProPad(globalPadId, fn) {
  // retrieve pad from cache
  var domainId = padutils.getDomainId(globalPadId);
  if (!domainId) {
    throw Error("not a pro pad: "+globalPadId);
  }
  var localPadId = padutils.globalToLocalId(globalPadId);
  var padRecord = pro_pad_db.getSingleRecord(domainId, localPadId);


  // YOURNAME:
  // YOURCOMMENT
  return _doWithProPadLock(domainId, localPadId, function() {
    var isDirty = false;

    var proPad = {

      // YOURNAME:
      // YOURCOMMENT
      exists: function() { return !!padRecord; },

      // YOURNAME:
      // YOURCOMMENT
      getDomainId: function() { return domainId; },

      // YOURNAME:
      // YOURCOMMENT
      getLocalPadId: function() { return localPadId; },

      // YOURNAME:
      // YOURCOMMENT
      getGlobalId: function() { return globalPadId; },

      // YOURNAME:
      // YOURCOMMENT
      getDisplayTitle: function() { return padutils.getProDisplayTitle(localPadId, padRecord.title); },

      // YOURNAME:
      // YOURCOMMENT
      setTitle: function(newTitle) {
        padRecord.title = newTitle;
        isDirty = true;
      },

      // YOURNAME:
      // YOURCOMMENT
      isDeleted: function() { return padRecord.isDeleted; },

      // YOURNAME:
      // YOURCOMMENT
      markDeleted: function() {
        padRecord.isDeleted = true;
        isDirty = true;
      },

      // YOURNAME:
      // YOURCOMMENT
      getPassword: function() { return padRecord.password; },

      // YOURNAME:
      // YOURCOMMENT
      setPassword: function(newPass) {
        if (newPass == "") {
          newPass = null;
        }
        padRecord.password = newPass;
        isDirty = true;
      },

      // YOURNAME:
      // YOURCOMMENT
      isArchived: function() { return padRecord.isArchived; },

      // YOURNAME:
      // YOURCOMMENT
      markArchived: function() {
        padRecord.isArchived = true;
        isDirty = true;
      },

      // YOURNAME:
      // YOURCOMMENT
      unmarkArchived: function() {
        padRecord.isArchived = false;
        isDirty = true;
      },

      // YOURNAME:
      // YOURCOMMENT
      setLastEditedDate: function(d) {
        padRecord.lastEditedDate = d;
        isDirty = true;
      },

      // YOURNAME:
      // YOURCOMMENT
      addEditor: function(editorId) {
        var es = String(editorId);
        if (es && es.length > 0 && stringutils.isNumeric(editorId)) {
          if (padRecord.proAttrs.editors.indexOf(editorId) < 0) {
            padRecord.proAttrs.editors.push(editorId);
            padRecord.proAttrs.editors.sort();
          }
          isDirty = true;
        }
      },

      // YOURNAME:
      // YOURCOMMENT
      setLastEditor: function(editorId) {
        var es = String(editorId);
        if (es && es.length > 0 && stringutils.isNumeric(editorId)) {
          padRecord.lastEditorId = editorId;
          this.addEditor(editorId);
          isDirty = true;
        }
      }
    };

    var ret = fn(proPad);

    if (isDirty) {
      pro_pad_db.update(padRecord);
    }

    return ret;
  });
}


// YOURNAME:
// YOURCOMMENT
function accessProPadLocal(localPadId, fn) {
   var globalPadId = padutils.getGlobalPadId(localPadId);
   return accessProPad(globalPadId, fn);
}

