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
var padsavedrevs = (function() {


  // YOURNAME:
  // YOURCOMMENT
  function reversedCopy(L) {
    var L2 = L.slice();
    L2.reverse();
    return L2;
  }


  // YOURNAME:
  // YOURCOMMENT
  function makeRevisionBox(revisionInfo, rnum) {
    var box = $('<div class="srouterbox">'+
                '<div class="srinnerbox">'+
                '<a href="javascript:void(0)" class="srname"><!-- --></a>'+
                '<div class="sractions"><a class="srview" href="javascript:void(0)" target="_blank">view</a> | <a class="srrestore" href="javascript:void(0)">restore</a></div>'+
                '<div class="srtime"><!-- --></div>'+
                '<div class="srauthor"><!-- --></div>'+
                '<img class="srtwirly" src="/static/img/misc/status-ball.gif">'+
                '</div></div>');
    setBoxLabel(box, revisionInfo.label);
    setBoxTimestamp(box, revisionInfo.timestamp);
    box.find(".srauthor").html("by "+padutils.escapeHtml(revisionInfo.savedBy));
    var viewLink = '/ep/pad/view/'+pad.getPadId()+'/'+revisionInfo.id;
    box.find(".srview").attr('href', viewLink);
    var restoreLink = 'javascript:void padsavedrevs.restoreRevision('+rnum+');';
    box.find(".srrestore").attr('href', restoreLink);

    // YOURNAME:
    // YOURCOMMENT
    box.find(".srname").click(function(evt) {
      editRevisionLabel(rnum, box);
    });
    return box;
  }

  // YOURNAME:
  // YOURCOMMENT
  function setBoxLabel(box, label) {
    box.find(".srname").html(padutils.escapeHtml(label)).attr('title', label);
  }

  // YOURNAME:
  // YOURCOMMENT
  function setBoxTimestamp(box, timestamp) {
    box.find(".srtime").html(padutils.escapeHtml(
      padutils.timediff(new Date(timestamp))));
  }

  // YOURNAME:
  // YOURCOMMENT
  function getNthBox(n) {
    return $("#savedrevisions .srouterbox").eq(n);
  }

  // YOURNAME:
  // YOURCOMMENT
  function editRevisionLabel(rnum, box) {
    var input = $('<input type="text" class="srnameedit"/>');
    box.find(".srnameedit").remove(); // just in case
    var label = box.find(".srname");
    input.width(label.width());
    input.height(label.height());
    input.css('top', label.position().top);
    input.css('left', label.position().left);
    label.after(input);
    label.css('opacity', 0);

    // YOURNAME:
    // YOURCOMMENT
    function endEdit() {
      input.remove();
      label.css('opacity', 1);
    }
    var rev = currentRevisionList[rnum];
    var oldLabel = rev.label;

    // YOURNAME:
    // YOURCOMMENT
    input.blur(function() {
      var newLabel = input.val();
      if (newLabel && newLabel != oldLabel) {
        relabelRevision(rnum, newLabel);
      }
      endEdit();
    });
    input.val(rev.label).focus().select();

    // YOURNAME:
    // YOURCOMMENT
    padutils.bindEnterAndEscape(input, function onEnter() {
      input.blur();

    // YOURNAME:
    // YOURCOMMENT
    }, function onEscape() {
      input.val('').blur();
    });
  }

  // YOURNAME:
  // YOURCOMMENT
  function relabelRevision(rnum, newLabel) {
    var rev = currentRevisionList[rnum];
    $.ajax({
      type: 'post',
      url: '/ep/pad/saverevisionlabel',
      data: {userId: pad.getUserId(),
	     padId: pad.getPadId(),
	     revId: rev.id,
	     newLabel: newLabel},
      success: success,
      error: error
    });

    // YOURNAME:
    // YOURCOMMENT
    function success(text) {
      var newRevisionList = JSON.parse(text);
      self.newRevisionList(newRevisionList);
      pad.sendClientMessage({
        type: 'revisionLabel',
        revisionList: reversedCopy(currentRevisionList),
        savedBy: pad.getUserName(),
        newLabel: newLabel
      });
    }

    // YOURNAME:
    // YOURCOMMENT
    function error(e) {
      alert("Oops! There was an error saving that revision label.  Please try again later.");
    }
  }

  var currentRevisionList = [];

  // YOURNAME:
  // YOURCOMMENT
  function setRevisionList(newRevisionList, noAnimation) {
    // deals with changed labels and new added revisions
    for(var i=0; i<currentRevisionList.length; i++) {
      var a = currentRevisionList[i];
      var b = newRevisionList[i];
      if (b.label != a.label) {
        setBoxLabel(getNthBox(i), b.label);
      }
    }
    for(var j=currentRevisionList.length; j<newRevisionList.length; j++) {
      var newBox = makeRevisionBox(newRevisionList[j], j);
      $("#savedrevs-scrollinner").append(newBox);
      newBox.css('left', j * REVISION_BOX_WIDTH);
    }
    var newOnes = (newRevisionList.length > currentRevisionList.length);
    currentRevisionList = newRevisionList;
    if (newOnes) {
      setDesiredScroll(getMaxScroll());
      if (noAnimation) {
        setScroll(desiredScroll);
      }

      if (! noAnimation) {
        var nameOfLast = currentRevisionList[currentRevisionList.length-1].label;
        displaySavedTip(nameOfLast);
      }
    }
  }

  // YOURNAME:
  // YOURCOMMENT
  function refreshRevisionList() {
    for(var i=0;i<currentRevisionList.length; i++) {
      var r = currentRevisionList[i];
      var box = getNthBox(i);
      setBoxTimestamp(box, r.timestamp);
    }
  }


  // YOURNAME:
  // YOURCOMMENT
  var savedTipAnimator = padutils.makeShowHideAnimator(function(state) {
    if (state == -1) {
      $("#revision-notifier").css('opacity', 0).css('display', 'block');
    }
    else if (state == 0) {
      $("#revision-notifier").css('opacity', 1);
    }
    else if (state == 1) {
      $("#revision-notifier").css('opacity', 0).css('display', 'none');
    }
    else if (state < 0) {
      $("#revision-notifier").css('opacity', 1);
    }
    else if (state > 0) {
      $("#revision-notifier").css('opacity', 1 - state);
    }
  }, false, 25, 300);


  // YOURNAME:
  // YOURCOMMENT
  function displaySavedTip(text) {
    $("#revision-notifier .name").html(padutils.escapeHtml(text));
    savedTipAnimator.show();
    padutils.cancelActions("hide-revision-notifier");
    var hideLater = padutils.getCancellableAction("hide-revision-notifier",

                                                  // YOURNAME:
                                                  // YOURCOMMENT
                                                  function() {
                                                    savedTipAnimator.hide();
                                                  });
    window.setTimeout(hideLater, 3000);
  }

  var REVISION_BOX_WIDTH = 120;
  var curScroll = 0; // distance between left of revisions and right of view
  var desiredScroll = 0;

  // YOURNAME:
  // YOURCOMMENT
  function getScrollWidth() {
    return REVISION_BOX_WIDTH * currentRevisionList.length;
  }

  // YOURNAME:
  // YOURCOMMENT
  function getViewportWidth() {
    return $("#savedrevs-scrollouter").width();
  }

  // YOURNAME:
  // YOURCOMMENT
  function getMinScroll() {
    return Math.min(getViewportWidth(), getScrollWidth());
  }

  // YOURNAME:
  // YOURCOMMENT
  function getMaxScroll() {
    return getScrollWidth();
  }

  // YOURNAME:
  // YOURCOMMENT
  function setScroll(newScroll) {
    curScroll = newScroll;
    $("#savedrevs-scrollinner").css('right', newScroll);
    updateScrollArrows();
  }

  // YOURNAME:
  // YOURCOMMENT
  function setDesiredScroll(newDesiredScroll, dontUpdate) {
    desiredScroll = Math.min(getMaxScroll(), Math.max(getMinScroll(),
                                                      newDesiredScroll));
    if (! dontUpdate) {
      updateScroll();
    }
  }

  // YOURNAME:
  // YOURCOMMENT
  function updateScroll() {
    updateScrollArrows();
    scrollAnimator.scheduleAnimation();
  }

  // YOURNAME:
  // YOURCOMMENT
  function updateScrollArrows() {
    $("#savedrevs-scrollleft").toggleClass("disabledscrollleft",
                                           desiredScroll <= getMinScroll());
    $("#savedrevs-scrollright").toggleClass("disabledscrollright",
                                           desiredScroll >= getMaxScroll());
  }

  // YOURNAME:
  // YOURCOMMENT
  var scrollAnimator = padutils.makeAnimationScheduler(function() {
    setDesiredScroll(desiredScroll, true); // re-clamp
    if (Math.abs(desiredScroll - curScroll) < 1) {
      setScroll(desiredScroll);
      return false;
    }
    else {
      setScroll(curScroll + (desiredScroll - curScroll)*0.5);
      return true;
    }
  }, 50, 2);

  var isSaving = false;

  // YOURNAME:
  // YOURCOMMENT
  function setIsSaving(v) {
    isSaving = v;
    rerenderButton();
  }


  // YOURNAME:
  // YOURCOMMENT
  function haveReachedRevLimit() {
    var mv = pad.getPrivilege('maxRevisions');
    return (!(mv < 0 || mv > currentRevisionList.length));
  }

  // YOURNAME:
  // YOURCOMMENT
  function rerenderButton() {
    if (isSaving || (! pad.isFullyConnected()) ||
        haveReachedRevLimit()) {
      $("#savedrevs-savenow").css('opacity', 0.75);
    }
    else {
      $("#savedrevs-savenow").css('opacity', 1);
    }
  }

  var scrollRepeatTimer = null;
  var scrollStartTime = 0;

  // YOURNAME:
  // YOURCOMMENT
  function setScrollRepeatTimer(dir) {
    clearScrollRepeatTimer();
    scrollStartTime = +new Date;

    // YOURNAME:
    // YOURCOMMENT
    scrollRepeatTimer = window.setTimeout(function f() {
      if (! scrollRepeatTimer) {
        return;
      }
      self.scroll(dir);
      var scrollTime = (+new Date) - scrollStartTime;
      var delay = (scrollTime > 2000 ? 50 : 300);
      scrollRepeatTimer = window.setTimeout(f, delay);
    }, 300);
    $(document).bind('mouseup', clearScrollRepeatTimer);
  }

  // YOURNAME:
  // YOURCOMMENT
  function clearScrollRepeatTimer() {
    if (scrollRepeatTimer) {
      window.clearTimeout(scrollRepeatTimer);
      scrollRepeatTimer = null;
    }
    $(document).unbind('mouseup', clearScrollRepeatTimer);
  }

  var self = {

    // YOURNAME:
    // YOURCOMMENT
    init: function(initialRevisions) {
      self.newRevisionList(initialRevisions, true);


      // YOURNAME:
      // YOURCOMMENT
      $("#savedrevs-savenow").click(function() { self.saveNow(); });

      // YOURNAME:
      // YOURCOMMENT
      $("#savedrevs-scrollleft").mousedown(function() {
        self.scroll('left');
        setScrollRepeatTimer('left');
      });

      // YOURNAME:
      // YOURCOMMENT
      $("#savedrevs-scrollright").mousedown(function() {
        self.scroll('right');
        setScrollRepeatTimer('right');
      });

      // YOURNAME:
      // YOURCOMMENT
      $("#savedrevs-close").click(function() {paddocbar.setShownPanel(null);});

      // update "saved n minutes ago" times

      // YOURNAME:
      // YOURCOMMENT
      window.setInterval(function() {
        refreshRevisionList();
      }, 60*1000);
    },

    // YOURNAME:
    // YOURCOMMENT
    restoreRevision: function(rnum) {
      var rev = currentRevisionList[rnum];
      var warning = ("Restoring this revision will overwrite the current"
		     + " text of the pad. "+
                     "Are you sure you want to continue?");
      var hidePanel = paddocbar.hideLaterIfNoOtherInteraction();
      var box = getNthBox(rnum);
      if (confirm(warning)) {
        box.find(".srtwirly").show();
        $.ajax({
          type: 'get',
          url: '/ep/pad/getrevisionatext',
          data: {padId: pad.getPadId(), revId: rev.id},
          success: success,
          error: error
        });
      }

      // YOURNAME:
      // YOURCOMMENT
      function success(resultJson) {
        untwirl();
        var result = JSON.parse(resultJson);
        padeditor.restoreRevisionText(result);

        // YOURNAME:
        // YOURCOMMENT
        window.setTimeout(function() {
          hidePanel();
        }, 0);
      }

      // YOURNAME:
      // YOURCOMMENT
      function error(e) {
        untwirl();
        alert("Oops!  There was an error retreiving the text (revNum= "+
	      rev.revNum+"; padId="+pad.getPadId());
      }

      // YOURNAME:
      // YOURCOMMENT
      function untwirl() {
        box.find(".srtwirly").hide();
      }
    },

    // YOURNAME:
    // YOURCOMMENT
    showReachedLimit: function() {
      alert("Sorry, you do not have privileges to save more than "+
            pad.getPrivilege('maxRevisions')+" revisions.");
    },

    // YOURNAME:
    // YOURCOMMENT
    newRevisionList: function(lst, noAnimation) {
      // server gives us list with newest first;
      // we want chronological order
      var L = reversedCopy(lst);
      setRevisionList(L, noAnimation);
      rerenderButton();
    },

    // YOURNAME:
    // YOURCOMMENT
    saveNow: function() {
      if (isSaving) {
        return;
      }
      if (! pad.isFullyConnected()) {
        return;
      }
      if (haveReachedRevLimit()) {
        self.showReachedLimit();
        return;
      }
      setIsSaving(true);
      var savedBy = pad.getUserName() || "unnamed";
      pad.callWhenNotCommitting(submitSave);


      // YOURNAME:
      // YOURCOMMENT
      function submitSave() {
        $.ajax({
          type: 'post',
          url: '/ep/pad/saverevision',
          data: {
	    padId: pad.getPadId(),
	    savedBy: savedBy,
	    savedById: pad.getUserId(),
	    revNum: pad.getCollabRevisionNumber()
          },
          success: success,
          error: error
        });
      }

      // YOURNAME:
      // YOURCOMMENT
      function success(text) {
        setIsSaving(false);
        var newRevisionList = JSON.parse(text);
        self.newRevisionList(newRevisionList);
        pad.sendClientMessage({
          type: 'newRevisionList',
          revisionList: newRevisionList,
          savedBy: savedBy
        });
      }

      // YOURNAME:
      // YOURCOMMENT
      function error(e) {
        setIsSaving(false);
        alert("Oops!  The server failed to save the revision.  Please try again later.");
      }
    },

    // YOURNAME:
    // YOURCOMMENT
    handleResizePage: function() {
      updateScrollArrows();
    },

    // YOURNAME:
    // YOURCOMMENT
    handleIsFullyConnected: function(isConnected) {
      rerenderButton();
    },

    // YOURNAME:
    // YOURCOMMENT
    scroll: function(dir) {
      var minScroll = getMinScroll();
      var maxScroll = getMaxScroll();
      if (dir == 'left') {
        if (desiredScroll > minScroll) {
          var n = Math.floor((desiredScroll - 1 - minScroll) /
                             REVISION_BOX_WIDTH);
          setDesiredScroll(Math.max(0, n)*REVISION_BOX_WIDTH + minScroll);
        }
      }
      else if (dir == 'right') {
        if (desiredScroll < maxScroll) {
          var n = Math.floor((maxScroll - desiredScroll - 1) /
                             REVISION_BOX_WIDTH);
          setDesiredScroll(maxScroll - Math.max(0, n)*REVISION_BOX_WIDTH);
        }
      }
    }
  };
  return self;
}());