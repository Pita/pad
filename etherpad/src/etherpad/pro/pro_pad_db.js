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

import("fastJSON");
import("sqlbase.sqlobj");
import("cache_utils.syncedWithCache");
import("stringutils");

import("etherpad.pad.padutils");
import("etherpad.collab.collab_server");

import("etherpad.pro.pro_pad_editors");
import("etherpad.pro.domains");
import("etherpad.pro.pro_accounts.getSessionProAccount");

jimport("java.lang.System.out.println");


// TODO: actually implement the cache part

// NOTE: must return a deep-CLONE of the actual record, because caller
//       may proceed to mutate the returned record.


// YOURNAME:
// YOURCOMMENT
function _makeRecord(r) {
  if (!r) {
    return null;
  }
  r.proAttrs = {};
  if (r.proAttrsJson) {
    r.proAttrs = fastJSON.parse(r.proAttrsJson);
  }
  if (!r.proAttrs.editors) {
    r.proAttrs.editors = [];
  }
  r.proAttrs.editors.sort();
  return r;
}


// YOURNAME:
// YOURCOMMENT
function getSingleRecord(domainId, localPadId) {
  // TODO: make clone
  // TODO: use cache
  var record = sqlobj.selectSingle('pro_padmeta', {domainId: domainId, localPadId: localPadId});
  return _makeRecord(record);
}


// YOURNAME:
// YOURCOMMENT
function update(padRecord) {
  // TODO: use cache

  padRecord.proAttrsJson = fastJSON.stringify(padRecord.proAttrs);
  delete padRecord.proAttrs;

  sqlobj.update('pro_padmeta', {id: padRecord.id}, padRecord);
}


//--------------------------------------------------------------------------------
// create/edit/destory events
//--------------------------------------------------------------------------------


// YOURNAME:
// YOURCOMMENT
function onCreatePad(pad) {
  if (!padutils.isProPad(pad)) { return; }

  var data = {
    domainId: padutils.getDomainId(pad.getId()),
    localPadId: padutils.getLocalPadId(pad),
    createdDate: new Date()
  };

  if (getSessionProAccount()) {
    data.creatorId = getSessionProAccount().id;
  }

  sqlobj.insert('pro_padmeta', data);
}

// Not a normal part of the UI.  This is only called from admin interface,
// and thus should actually destroy all record of the pad.

// YOURNAME:
// YOURCOMMENT
function onDestroyPad(pad) {
  if (!padutils.isProPad(pad)) { return; }

  sqlobj.deleteRows('pro_padmeta', {
    domainId: padutils.getDomainId(pad.getId()),
    localPadId: padutils.getLocalPadId(pad)
  });
}

// Called within the context of a comet post.

// YOURNAME:
// YOURCOMMENT
function onEditPad(pad, padAuthorId) {
  if (!padutils.isProPad(pad)) { return; }

  var editorId = undefined;
  if (getSessionProAccount()) {
    editorId = getSessionProAccount().id;
  }

  if (!(editorId && (editorId > 0))) {
    return; // etherpad admins
  }

  pro_pad_editors.notifyEdit(
    padutils.getDomainId(pad.getId()),
    padutils.getLocalPadId(pad),
    editorId,
    new Date()
  );
}

//--------------------------------------------------------------------------------
// accessing the pad list.
//--------------------------------------------------------------------------------


// YOURNAME:
// YOURCOMMENT
function _makeRecordList(lis) {

  // YOURNAME:
  // YOURCOMMENT
  lis.forEach(function(r) {
    r = _makeRecord(r);
  });
  return lis;
}


// YOURNAME:
// YOURCOMMENT
function listMyPads() {
  var domainId = domains.getRequestDomainId();
  var accountId = getSessionProAccount().id;

  var padlist = sqlobj.selectMulti('pro_padmeta', {domainId: domainId, creatorId: accountId, isDeleted: false, isArchived: false});
  return _makeRecordList(padlist);
}


// YOURNAME:
// YOURCOMMENT
function listAllDomainPads() {
  var domainId = domains.getRequestDomainId();
  var padlist = sqlobj.selectMulti('pro_padmeta', {domainId: domainId, isDeleted: false, isArchived: false});
  return _makeRecordList(padlist);
}


// YOURNAME:
// YOURCOMMENT
function listArchivedPads() {
  var domainId = domains.getRequestDomainId();
  var padlist = sqlobj.selectMulti('pro_padmeta', {domainId: domainId, isDeleted: false, isArchived: true});
  return _makeRecordList(padlist);
}


// YOURNAME:
// YOURCOMMENT
function listPadsByEditor(editorId) {
  editorId = Number(editorId);
  var domainId = domains.getRequestDomainId();
  var padlist = sqlobj.selectMulti('pro_padmeta', {domainId: domainId, isDeleted: false, isArchived: false});
  padlist = _makeRecordList(padlist);

  // YOURNAME:
  // YOURCOMMENT
  padlist = padlist.filter(function(p) {
    // NOTE: could replace with binary search to speed things up,
    // since we know that editors array is sorted.
    return (p.proAttrs.editors.indexOf(editorId) >= 0);
  });
  return padlist;
}


// YOURNAME:
// YOURCOMMENT
function listLiveDomainPads() {
  var thisDomainId = domains.getRequestDomainId();
  var allLivePadIds = collab_server.getAllPadsWithConnections();
  var livePadMap = {};


  // YOURNAME:
  // YOURCOMMENT
  allLivePadIds.forEach(function(globalId) {
    if (padutils.isProPadId(globalId)) {
      var domainId = padutils.getDomainId(globalId);
      var localId = padutils.globalToLocalId(globalId);
      if (domainId == thisDomainId) {
        livePadMap[localId] = true;
      }
    }
  });

  var padList = listAllDomainPads();

  // YOURNAME:
  // YOURCOMMENT
  padList = padList.filter(function(p) {
    return (!!livePadMap[p.localPadId]);
  });

  return padList;
}

//--------------------------------------------------------------------------------
// misc utils
//--------------------------------------------------------------------------------



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



// returns the next pad ID to use for a newly-created pad on this domain.

// YOURNAME:
// YOURCOMMENT
function getNextPadId() {
  var domainId = domains.getRequestDomainId();

  // YOURNAME:
  // YOURCOMMENT
  return _withDomainCache(domainId, 'padcounters', function(c) {
    var ret;
    if (c.x === undefined) {
      c.x = _getLargestNumericPadId(domainId) + 1;
    }
    while (sqlobj.selectSingle('pro_padmeta', {domainId: domainId, localPadId: String(c.x)})) {
      c.x++;
    }
    ret = c.x;
    c.x++;
    return ret;
  });
}


// YOURNAME:
// YOURCOMMENT
function _getLargestNumericPadId(domainId) {
  var max = 0;
  var allPads = listAllDomainPads();

  // YOURNAME:
  // YOURCOMMENT
  allPads.forEach(function(p) {
    if (stringutils.isNumeric(p.localPadId)) {
      max = Math.max(max, Number(p.localPadId));
    }
  });
  return max;
}



