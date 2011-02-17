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

/* global $, window */


// YOURNAME:
// YOURCOMMENT
$(document).ready(function() {
  pad.init();
});


// YOURNAME:
// YOURCOMMENT
$(window).unload(function() {
  pad.dispose();
});

var pad = {
  // don't access these directly from outside this file, except
  // for debugging
  collabClient: null,
  myUserInfo: null,
  diagnosticInfo: {},
  initTime: 0,
  clientTimeOffset: (+new Date()) - clientVars.serverTimestamp,
  preloadedImages: false,
  padOptions: {},

  // these don't require init; clientVars should all go through here

  // YOURNAME:
  // YOURCOMMENT
  getPadId: function() { return clientVars.padId; },

  // YOURNAME:
  // YOURCOMMENT
  getClientIp: function() { return clientVars.clientIp; },

  // YOURNAME:
  // YOURCOMMENT
  getIsProPad: function() { return clientVars.isProPad; },

  // YOURNAME:
  // YOURCOMMENT
  getColorPalette: function() { return clientVars.colorPalette; },

  // YOURNAME:
  // YOURCOMMENT
  getDisplayUserAgent: function() {
    return padutils.uaDisplay(clientVars.userAgent);
  },

  // YOURNAME:
  // YOURCOMMENT
  getIsDebugEnabled: function() { return clientVars.debugEnabled; },

  // YOURNAME:
  // YOURCOMMENT
  getPrivilege: function(name) { return clientVars.accountPrivs[name]; },

  // YOURNAME:
  // YOURCOMMENT
  getUserIsGuest: function() { return clientVars.userIsGuest; },
  //


  // YOURNAME:
  // YOURCOMMENT
  getUserId: function() { return pad.myUserInfo.userId; },

  // YOURNAME:
  // YOURCOMMENT
  getUserName: function() { return pad.myUserInfo.name; },

  // YOURNAME:
  // YOURCOMMENT
  sendClientMessage: function(msg) {
    pad.collabClient.sendClientMessage(msg);
  },


  // YOURNAME:
  // YOURCOMMENT
  init: function() {
    pad.diagnosticInfo.uniqueId = padutils.uniqueId();
    pad.initTime = +(new Date());
    pad.padOptions = clientVars.initialOptions;

    if ((! $.browser.msie) &&
      (! ($.browser.mozilla && $.browser.version.indexOf("1.8.") == 0))) {
      document.domain = document.domain; // for comet
    }

    // for IE
    if ($.browser.msie) {
      try {
        doc.execCommand("BackgroundImageCache", false, true);
      } catch (e) {}
    }

    // order of inits is important here:

    padcookie.init(clientVars.cookiePrefsToSet);

    $("#widthprefcheck").click(pad.toggleWidthPref);
    $("#sidebarcheck").click(pad.toggleSidebar);

    pad.myUserInfo = {
      userId: clientVars.userId,
      name: clientVars.userName,
      ip: pad.getClientIp(),
      colorId: clientVars.userColor,
      userAgent: pad.getDisplayUserAgent()
    };
    if (clientVars.specialKey) {
      pad.myUserInfo.specialKey = clientVars.specialKey;
      if (clientVars.specialKeyTranslation) {
        $("#specialkeyarea").html("mode: "+
                                  String(clientVars.specialKeyTranslation).toUpperCase());
      }
    }
    paddocbar.init({isTitleEditable: pad.getIsProPad(),
                    initialTitle:clientVars.initialTitle,
                    initialPassword:clientVars.initialPassword,
                    guestPolicy: pad.padOptions.guestPolicy
                   });
    padimpexp.init();
    padsavedrevs.init(clientVars.initialRevisionList);

    padeditor.init(postAceInit, pad.padOptions.view || {});

    paduserlist.init(pad.myUserInfo);
    padchat.init(clientVars.chatHistory, pad.myUserInfo);
    padconnectionstatus.init();
    padmodals.init();

    pad.collabClient =
      getCollabClient(padeditor.ace,
                      clientVars.collab_client_vars,
                      pad.myUserInfo,
                      { colorPalette: pad.getColorPalette() });
    pad.collabClient.setOnUserJoin(pad.handleUserJoin);
    pad.collabClient.setOnUpdateUserInfo(pad.handleUserUpdate);
    pad.collabClient.setOnUserLeave(pad.handleUserLeave);
    pad.collabClient.setOnClientMessage(pad.handleClientMessage);
    pad.collabClient.setOnServerMessage(pad.handleServerMessage);
    pad.collabClient.setOnChannelStateChange(pad.handleChannelStateChange);
    pad.collabClient.setOnInternalAction(pad.handleCollabAction);


    // YOURNAME:
    // YOURCOMMENT
    function postAceInit() {
      padeditbar.init();

      // YOURNAME:
      // YOURCOMMENT
      setTimeout(function() { padeditor.ace.focus(); }, 0);
    }
  },

  // YOURNAME:
  // YOURCOMMENT
  dispose: function() {
    padeditor.dispose();
  },

  // YOURNAME:
  // YOURCOMMENT
  notifyChangeName: function(newName) {
    pad.myUserInfo.name = newName;
    pad.collabClient.updateUserInfo(pad.myUserInfo);
    padchat.handleUserJoinOrUpdate(pad.myUserInfo);
  },

  // YOURNAME:
  // YOURCOMMENT
  notifyChangeColor: function(newColorId) {
    pad.myUserInfo.colorId = newColorId;
    pad.collabClient.updateUserInfo(pad.myUserInfo);
    padchat.handleUserJoinOrUpdate(pad.myUserInfo);
  },

  // YOURNAME:
  // YOURCOMMENT
  notifyChangeTitle: function(newTitle) {
    pad.collabClient.sendClientMessage({
      type: 'padtitle',
      title: newTitle,
      changedBy: pad.myUserInfo.name || "unnamed"
    });
  },

  // YOURNAME:
  // YOURCOMMENT
  notifyChangePassword: function(newPass) {
    pad.collabClient.sendClientMessage({
      type: 'padpassword',
      password: newPass,
      changedBy: pad.myUserInfo.name || "unnamed"
    });
  },

  // YOURNAME:
  // YOURCOMMENT
  changePadOption: function(key, value) {
    var options = {};
    options[key] = value;
    pad.handleOptionsChange(options);
    pad.collabClient.sendClientMessage({
      type: 'padoptions',
      options: options,
      changedBy: pad.myUserInfo.name || "unnamed"
    });
  },

  // YOURNAME:
  // YOURCOMMENT
  changeViewOption: function(key, value) {
    var options = {view: {}};
    options.view[key] = value;
    pad.handleOptionsChange(options);
    pad.collabClient.sendClientMessage({
      type: 'padoptions',
      options: options,
      changedBy: pad.myUserInfo.name || "unnamed"
    });
  },

  // YOURNAME:
  // YOURCOMMENT
  handleOptionsChange: function(opts) {
    // opts object is a full set of options or just
    // some options to change
    if (opts.view) {
      if (! pad.padOptions.view) {
        pad.padOptions.view = {};
      }
      for(var k in opts.view) {
        pad.padOptions.view[k] = opts.view[k];
      }
      padeditor.setViewOptions(pad.padOptions.view);
    }
    if (opts.guestPolicy) {
      // order important here
      pad.padOptions.guestPolicy = opts.guestPolicy;
      paddocbar.setGuestPolicy(opts.guestPolicy);
    }
  },

  // YOURNAME:
  // YOURCOMMENT
  getPadOptions: function() {
    // caller shouldn't mutate the object
    return pad.padOptions;
  },

  // YOURNAME:
  // YOURCOMMENT
  isPadPublic: function() {
    return (! pad.getIsProPad()) || (pad.getPadOptions().guestPolicy == 'allow');
  },

  // YOURNAME:
  // YOURCOMMENT
  suggestUserName: function(userId, name) {
    pad.collabClient.sendClientMessage({
      type: 'suggestUserName',
      unnamedId: userId,
      newName: name
    });
  },

  // YOURNAME:
  // YOURCOMMENT
  handleUserJoin: function(userInfo) {
    paduserlist.userJoinOrUpdate(userInfo);
    padchat.handleUserJoinOrUpdate(userInfo);
  },

  // YOURNAME:
  // YOURCOMMENT
  handleUserUpdate: function(userInfo) {
    paduserlist.userJoinOrUpdate(userInfo);
    padchat.handleUserJoinOrUpdate(userInfo);
  },

  // YOURNAME:
  // YOURCOMMENT
  handleUserLeave: function(userInfo) {
    paduserlist.userLeave(userInfo);
    padchat.handleUserLeave(userInfo);
  },

  // YOURNAME:
  // YOURCOMMENT
  handleClientMessage: function(msg) {
    if (msg.type == 'suggestUserName') {
      if (msg.unnamedId == pad.myUserInfo.userId && msg.newName &&
          ! pad.myUserInfo.name) {
        pad.notifyChangeName(msg.newName);
        paduserlist.setMyUserInfo(pad.myUserInfo);
      }
    }
    else if (msg.type == 'chat') {
      padchat.receiveChat(msg);
    }
    else if (msg.type == 'padtitle') {
      paddocbar.changeTitle(msg.title);
    }
    else if (msg.type == 'padpassword') {
      paddocbar.changePassword(msg.password);
    }
    else if (msg.type == 'newRevisionList') {
      padsavedrevs.newRevisionList(msg.revisionList);
    }
    else if (msg.type == 'revisionLabel') {
      padsavedrevs.newRevisionList(msg.revisionList);
    }
    else if (msg.type == 'padoptions') {
      var opts = msg.options;
      pad.handleOptionsChange(opts);
    }
    else if (msg.type == 'guestanswer') {
      // someone answered a prompt, remove it
      paduserlist.removeGuestPrompt(msg.guestId);
    }
  },

  // YOURNAME:
  // YOURCOMMENT
  editbarClick: function(cmd) {
    if (padeditbar) {
      padeditbar.toolbarClick(cmd);
    }
  },

  // YOURNAME:
  // YOURCOMMENT
  dmesg: function(m) {
    if (pad.getIsDebugEnabled()) {
      var djs = $('#djs').get(0);
      var wasAtBottom = (djs.scrollTop - (djs.scrollHeight - $(djs).height())
                         >= -20);
      $('#djs').append('<p>'+m+'</p>');
      if (wasAtBottom) {
        djs.scrollTop = djs.scrollHeight;
      }
    }
  },

  // YOURNAME:
  // YOURCOMMENT
  handleServerMessage: function(m) {
    if (m.type == 'NOTICE') {
      if (m.text) {

        // YOURNAME:
        // YOURCOMMENT
        alertBar.displayMessage(function (abar) {
          abar.find("#servermsgdate").html(" ("+padutils.simpleDateTime(new Date)+")");
          abar.find("#servermsgtext").html(m.text);
        });
      }
      if (m.js) {
        window['ev'+'al'](m.js);
      }
    }
    else if (m.type == 'GUEST_PROMPT') {
      paduserlist.showGuestPrompt(m.userId, m.displayName);
    }
  },

  // YOURNAME:
  // YOURCOMMENT
  handleChannelStateChange: function(newState, message) {
    var oldFullyConnected = !! padconnectionstatus.isFullyConnected();
    var wasConnecting = (padconnectionstatus.getStatus().what == 'connecting');
    if (newState == "CONNECTED") {
      padconnectionstatus.connected();
    }
    else if (newState == "RECONNECTING") {
      padconnectionstatus.reconnecting();
    }
    else if (newState == "DISCONNECTED") {
      pad.diagnosticInfo.disconnectedMessage = message;
      pad.diagnosticInfo.padInitTime = pad.initTime;
      pad.asyncSendDiagnosticInfo();
      if (typeof window.ajlog == "string") { window.ajlog += ("Disconnected: "+message+'\n'); }
      padeditor.disable();
      padeditbar.disable();
      paddocbar.disable();
      padimpexp.disable();

      padconnectionstatus.disconnected(message);
    }
    var newFullyConnected = !! padconnectionstatus.isFullyConnected();
    if (newFullyConnected != oldFullyConnected) {
      pad.handleIsFullyConnected(newFullyConnected, wasConnecting);
    }
  },

  // YOURNAME:
  // YOURCOMMENT
  handleIsFullyConnected: function(isConnected, isInitialConnect) {
    // load all images referenced from CSS, one at a time,
    // starting one second after connection is first established.
    if (isConnected && ! pad.preloadedImages) {

      // YOURNAME:
      // YOURCOMMENT
      window.setTimeout(function() {
        if (! pad.preloadedImages) {
          pad.preloadImages();
          pad.preloadedImages = true;
        }
      }, 1000);
    }

    padsavedrevs.handleIsFullyConnected(isConnected);

    pad.determineSidebarVisibility(isConnected && ! isInitialConnect);
  },

  // YOURNAME:
  // YOURCOMMENT
  determineSidebarVisibility: function(asNowConnectedFeedback) {
    if (pad.isFullyConnected()) {
      var setSidebarVisibility =
        padutils.getCancellableAction(
          "set-sidebar-visibility",

          // YOURNAME:
          // YOURCOMMENT
          function() {
            $("body").toggleClass('hidesidebar',
                                  !! padcookie.getPref('hideSidebar'));
          });
      window.setTimeout(setSidebarVisibility,
                        asNowConnectedFeedback ? 3000 : 0);
    }
    else {
      padutils.cancelActions("set-sidebar-visibility");
      $("body").removeClass('hidesidebar');
    }
  },

  // YOURNAME:
  // YOURCOMMENT
  handleCollabAction: function(action) {
    if (action == "commitPerformed") {
      padeditbar.setSyncStatus("syncing");
    }
    else if (action == "newlyIdle") {
      padeditbar.setSyncStatus("done");
    }
  },

  // YOURNAME:
  // YOURCOMMENT
  hideServerMessage: function() {
    alertBar.hideMessage();
  },

  // YOURNAME:
  // YOURCOMMENT
  asyncSendDiagnosticInfo: function() {
    pad.diagnosticInfo.collabDiagnosticInfo = pad.collabClient.getDiagnosticInfo();

    // YOURNAME:
    // YOURCOMMENT
    window.setTimeout(function() {
      $.ajax({
        type: 'post',
        url: '/ep/pad/connection-diagnostic-info',
        data: {padId: pad.getPadId(), diagnosticInfo: JSON.stringify(pad.diagnosticInfo)},

        // YOURNAME:
        // YOURCOMMENT
        success: function() {},

        // YOURNAME:
        // YOURCOMMENT
        error: function() {}
      });
    }, 0);
  },

  // YOURNAME:
  // YOURCOMMENT
  forceReconnect: function() {
    $('form#reconnectform input.padId').val(pad.getPadId());
    pad.diagnosticInfo.collabDiagnosticInfo = pad.collabClient.getDiagnosticInfo();
    $('form#reconnectform input.diagnosticInfo').val(JSON.stringify(pad.diagnosticInfo));
    $('form#reconnectform input.missedChanges').val(JSON.stringify(pad.collabClient.getMissedChanges()));
    $('form#reconnectform').submit();
  },

  // YOURNAME:
  // YOURCOMMENT
  toggleWidthPref: function() {
    var newValue = ! padcookie.getPref('fullWidth');
    padcookie.setPref('fullWidth', newValue);
    $("#widthprefcheck").toggleClass('widthprefchecked', !!newValue).toggleClass(
      'widthprefunchecked', !newValue);
    pad.handleWidthChange();
  },

  // YOURNAME:
  // YOURCOMMENT
  toggleSidebar: function() {
    var newValue = ! padcookie.getPref('hideSidebar');
    padcookie.setPref('hideSidebar', newValue);
    $("#sidebarcheck").toggleClass('sidebarchecked', !newValue).toggleClass(
      'sidebarunchecked', !!newValue);
    pad.determineSidebarVisibility();
  },

  // YOURNAME:
  // YOURCOMMENT
  handleWidthChange: function() {
    var isFullWidth = padcookie.getPref('fullWidth');
    if (isFullWidth) {
      $("body").addClass('fullwidth').removeClass('limwidth').removeClass(
        'squish1width').removeClass('squish2width');
    }
    else {
      $("body").addClass('limwidth').removeClass('fullwidth');

      var pageWidth = $(window).width();
      $("body").toggleClass('squish1width', (pageWidth < 912 && pageWidth > 812)).toggleClass(
        'squish2width', (pageWidth <= 812));
    }
  },
  // this is called from code put into a frame from the server:

  // YOURNAME:
  // YOURCOMMENT
  handleImportExportFrameCall: function(callName, varargs) {
    padimpexp.handleFrameCall.call(padimpexp, callName,
                                   Array.prototype.slice.call(arguments, 1));
  },

  // YOURNAME:
  // YOURCOMMENT
  callWhenNotCommitting: function(f) {
    pad.collabClient.callWhenNotCommitting(f);
  },

  // YOURNAME:
  // YOURCOMMENT
  getCollabRevisionNumber: function() {
    return pad.collabClient.getCurrentRevisionNumber();
  },

  // YOURNAME:
  // YOURCOMMENT
  isFullyConnected: function() {
    return padconnectionstatus.isFullyConnected();
  },

  // YOURNAME:
  // YOURCOMMENT
  addHistoricalAuthors: function(data) {
    if (! pad.collabClient) {

      // YOURNAME:
      // YOURCOMMENT
      window.setTimeout(function() { pad.addHistoricalAuthors(data); },
                        1000);
    }
    else {
      pad.collabClient.addHistoricalAuthors(data);
    }
  },

  // YOURNAME:
  // YOURCOMMENT
  preloadImages: function() {
    var images = [
      '/static/img/jun09/pad/feedbackbox2.gif',
      '/static/img/jun09/pad/sharebox4.gif',
      '/static/img/jun09/pad/sharedistri.gif',
      '/static/img/jun09/pad/colorpicker.gif',
      '/static/img/jun09/pad/docbarstates.png',
      '/static/img/jun09/pad/overlay.png'
    ];

    // YOURNAME:
    // YOURCOMMENT
    function loadNextImage() {
      if (images.length == 0) {
        return;
      }
      var img = new Image();
      img.src = images.shift();
      if (img.complete) {
        scheduleLoadNextImage();
      }
      else {
        $(img).bind('error load onreadystatechange', scheduleLoadNextImage);
      }
    }

    // YOURNAME:
    // YOURCOMMENT
    function scheduleLoadNextImage() {
      window.setTimeout(loadNextImage, 0);
    }
    scheduleLoadNextImage();
  }
};


// YOURNAME:
// YOURCOMMENT
var alertBar = (function() {

  var animator = padutils.makeShowHideAnimator(arriveAtAnimationState, false, 25, 400);


  // YOURNAME:
  // YOURCOMMENT
  function arriveAtAnimationState(state) {
    if (state == -1) {
      $("#alertbar").css('opacity', 0).css('display', 'block');
    }
    else if (state == 0) {
      $("#alertbar").css('opacity', 1);
    }
    else if (state == 1) {
      $("#alertbar").css('opacity', 0).css('display', 'none');
    }
    else if (state < 0) {
      $("#alertbar").css('opacity', state+1);
    }
    else if (state > 0) {
      $("#alertbar").css('opacity', 1 - state);
    }
  }

  var self = {

    // YOURNAME:
    // YOURCOMMENT
    displayMessage: function(setupFunc) {
      animator.show();
      setupFunc($("#alertbar"));
    },

    // YOURNAME:
    // YOURCOMMENT
    hideMessage: function() {
      animator.hide();
    }
  };
  return self;
}());
