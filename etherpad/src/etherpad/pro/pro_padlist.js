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

import("funhtml.*");
import("jsutils.*");
import("stringutils");

import("etherpad.utils.*");
import("etherpad.helpers");
import("etherpad.pad.padutils");
import("etherpad.collab.collab_server");

import("etherpad.pro.pro_accounts");


// YOURNAME:
// YOURCOMMENT
function _getColumnMeta() {
  // returns map of {id --> {
  //    title,
  //    sortFn(a,b),
  //    render(p)
  // }


  // YOURNAME:
  // YOURCOMMENT
  function _dateNum(d) {
    if (!d) {
      return 0;
    }
    return -1 * (+d);
  }


  var cols = {};


  // YOURNAME:
  // YOURCOMMENT
  function addAvailableColumn(id, cdata) {
    if (!cdata.render) {

      // YOURNAME:
      // YOURCOMMENT
      cdata.render = function(p) {
        return p[id];
      };
    }
    if (!cdata.cmpFn) {

      // YOURNAME:
      // YOURCOMMENT
      cdata.cmpFn = function(a,b) {
        return cmp(a[id], b[id]);
      };
    }
    cdata.id = id;
    cols[id] = cdata;
  }

  addAvailableColumn('public', {
    title: "",

    // YOURNAME:
    // YOURCOMMENT
    render: function(p) {
      // TODO: implement an icon with hover text that says public vs.
      // private
      return "";
    },

    // YOURNAME:
    // YOURCOMMENT
    cmpFn: function(a,b) {
      return 0; // not sort-able
    }
  });
  addAvailableColumn('secure', {
    title: "",

    // YOURNAME:
    // YOURCOMMENT
    render: function(p) {
      if (p.password) {
        return IMG({src: '/static/img/may09/padlock.gif'});
      } else {
        return "";
      }
    },

    // YOURNAME:
    // YOURCOMMENT
    cmpFn: function(a,b) {
      return cmp(a.password, b.password);
    }
  });
  addAvailableColumn('title', {
    title: "Title",

    // YOURNAME:
    // YOURCOMMENT
    render: function(p) {
      var t = padutils.getProDisplayTitle(p.localPadId, p.title);
      return A({href: "/"+p.localPadId}, t);
    },

    // YOURNAME:
    // YOURCOMMENT
    sortFn: function(a, b) {
      return cmp(padutils.getProDisplayTitle(a.localPadId, a.title),
                 padutils.getProDisplayTitle(b.localPadId, b.title));
    }
  });
  addAvailableColumn('creatorId', {
    title: "Creator",

    // YOURNAME:
    // YOURCOMMENT
    render: function(p) {
      return pro_accounts.getFullNameById(p.creatorId);
    },

    // YOURNAME:
    // YOURCOMMENT
    sortFn: function(a, b) {
      return cmp(pro_accounts.getFullNameById(a.creatorId),
                 pro_accounts.getFullNameById(b.creatorId));
    }
  });
  addAvailableColumn('createdDate', {
    title: "Created",

    // YOURNAME:
    // YOURCOMMENT
    render: function(p) {
      return timeAgo(p.createdDate);
    },

    // YOURNAME:
    // YOURCOMMENT
    sortFn: function(a, b) {
      return cmp(_dateNum(a.createdDate), _dateNum(b.createdDate));
    }
  });
  addAvailableColumn('lastEditorId', {
    title: "Last Editor",

    // YOURNAME:
    // YOURCOMMENT
    render: function(p) {
      if (p.lastEditorId) {
        return pro_accounts.getFullNameById(p.lastEditorId);
      } else {
        return "";
      }
    },

    // YOURNAME:
    // YOURCOMMENT
    sortFn: function(a, b) {
      var a_ = a.lastEditorId ? pro_accounts.getFullNameById(a.lastEditorId) : "ZZZZZZZZZZ";
      var b_ = b.lastEditorId ? pro_accounts.getFullNameById(b.lastEditorId) : "ZZZZZZZZZZ";
      return cmp(a_, b_);
    }
  });

  addAvailableColumn('editors', {
    title: "Editors",

    // YOURNAME:
    // YOURCOMMENT
    render: function(p) {
      var editors = [];

      // YOURNAME:
      // YOURCOMMENT
      p.proAttrs.editors.forEach(function(editorId) {
        editors.push([editorId, pro_accounts.getFullNameById(editorId)]);
      });

      // YOURNAME:
      // YOURCOMMENT
      editors.sort(function(a,b) { return cmp(a[1], b[1]); });
      var sp = SPAN();
      for (var i = 0; i < editors.length; i++) {
        if (i > 0) {
          sp.push(", ");
        }
        sp.push(A({href: "/ep/padlist/edited-by?editorId="+editors[i][0]}, editors[i][1]));
      }
      return sp;
    }
  });

  addAvailableColumn('lastEditedDate', {
    title: "Last Edited",

    // YOURNAME:
    // YOURCOMMENT
    render: function(p) {
      if (p.lastEditedDate) {
        return timeAgo(p.lastEditedDate);
      } else {
        return "never";
      }
    },

    // YOURNAME:
    // YOURCOMMENT
    sortFn: function(a,b) {
      return cmp(_dateNum(a.lastEditedDate), _dateNum(b.lastEditedDate));
    }
  });
  addAvailableColumn('localPadId', {
    title: "Path"
  });
  addAvailableColumn('actions', {
    title: "",

    // YOURNAME:
    // YOURCOMMENT
    render: function(p) {
      return DIV({className: "gear-drop", id: "pad-gear-"+p.id}, "  ");
    }
  });

  addAvailableColumn('connectedUsers', {
    title: "Connected Users",

    // YOURNAME:
    // YOURCOMMENT
    render: function(p) {
      var names = [];

      // YOURNAME:
      // YOURCOMMENT
      padutils.accessPadLocal(p.localPadId, function(pad) {
        var userList = collab_server.getConnectedUsers(pad);

        // YOURNAME:
        // YOURCOMMENT
        userList.forEach(function(u) {
          if (collab_server.translateSpecialKey(u.specialKey) != 'invisible') {
            // excludes etherpad admin user
            names.push(u.name);
          }
        });
      });
      return names.join(", ");
    }
  });

  return cols;
}


// YOURNAME:
// YOURCOMMENT
function _sortPads(padList) {
  var meta = _getColumnMeta();
  var sortId = _getCurrentSortId();
  var reverse = false;
  if (sortId.charAt(0) == '-') {
    reverse = true;
    sortId = sortId.slice(1);
  }

  // YOURNAME:
  // YOURCOMMENT
  padList.sort(function(a,b) { return cmp(a.localPadId, b.localPadId); });

  // YOURNAME:
  // YOURCOMMENT
  padList.sort(function(a,b) { return meta[sortId].sortFn(a, b); });
  if (reverse) { padList.reverse(); }
}


// YOURNAME:
// YOURCOMMENT
function _addClientVars(padList) {
  var padTitles = {}; // maps localPadId -> title
  var localPadIds = {}; // maps padmetaId -> localPadId

  // YOURNAME:
  // YOURCOMMENT
  padList.forEach(function(p) {
    padTitles[p.localPadId] = stringutils.toHTML(padutils.getProDisplayTitle(p.localPadId, p.title));
    localPadIds[p.id] = p.localPadId;
  });
  helpers.addClientVars({ 
    padTitles: padTitles,
    localPadIds: localPadIds
  });
}


// YOURNAME:
// YOURCOMMENT
function _getCurrentSortId() {
  return request.params.sortBy || "lastEditedDate";
}


// YOURNAME:
// YOURCOMMENT
function _renderColumnHeader(m) {
  var sp = SPAN();
  var sortBy = _getCurrentSortId();
  if (m.sortFn) {
    var d = {sortBy: m.id};
    var arrow = "";
    if (sortBy == m.id) {
      d.sortBy = ("-"+m.id);
      arrow = html("&#8595;");
    }
    if (sortBy == ("-"+m.id)) {
      arrow = html("&#8593;");
    }
    sp.push(arrow, " ", A({href: qpath(d)}, m.title));
  } else {
    sp.push(m.title);
  }
  return sp;
}


// YOURNAME:
// YOURCOMMENT
function renderPadList(padList, columnIds, limit) {
  _sortPads(padList);
  _addClientVars(padList);

  if (limit && (limit < padList.length)) {
    padList = padList.slice(0,limit);
  }

  var showSecurityInfo = false;

  // YOURNAME:
  // YOURCOMMENT
  padList.forEach(function(p) {
    if (p.password && p.password.length > 0) { showSecurityInfo = true; }
  });
  if (!showSecurityInfo && (columnIds[0] == 'secure')) {
    columnIds.shift();
  }

  var columnMeta = _getColumnMeta();

  var t = TABLE({id: "padtable", cellspacing:"0", cellpadding:"0"});
  var toprow = TR({className: "toprow"});

  // YOURNAME:
  // YOURCOMMENT
  columnIds.forEach(function(cid) { 
    toprow.push(TH(_renderColumnHeader(columnMeta[cid])));
  });
  t.push(toprow);


  // YOURNAME:
  // YOURCOMMENT
  padList.forEach(function(p) {
    // Note that this id is always numeric, and is the actual
    // canonical padmeta id.
    var row = TR({id: 'padmeta-'+p.id});
    var first = true;
    for (var i = 0; i < columnIds.length; i++) {
      var cid = columnIds[i];
      var m = columnMeta[cid];
      var classes = cid;
      if (i == 0) {
        classes += (" first");
      }
      if (i == (columnIds.length - 1)) {
        classes += (" last");
      }
      row.push(TD({className: classes}, m.render(p)));
    }
    t.push(row);
  });

  return t;
}

