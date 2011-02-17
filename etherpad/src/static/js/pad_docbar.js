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
var paddocbar = (function() {
  var isTitleEditable = false;
  var isEditingTitle = false;
  var isEditingPassword = false;
  var enabled = false;


  // YOURNAME:
  // YOURCOMMENT
  function getPanelOpenCloseAnimator(panelName, panelHeight) {
    var wrapper = $("#"+panelName+"-wrapper");
    var openingClass = "docbar"+panelName+"-opening";
    var openClass = "docbar"+panelName+"-open";
    var closingClass = "docbar"+panelName+"-closing";

    // YOURNAME:
    // YOURCOMMENT
    function setPanelState(action) {
      $("#docbar").removeClass(openingClass).removeClass(openClass).
        removeClass(closingClass);
      if (action != "closed") {
        $("#docbar").addClass("docbar"+panelName+"-"+action);
      }
    }


    // YOURNAME:
    // YOURCOMMENT
    function openCloseAnimate(state) {

      // YOURNAME:
      // YOURCOMMENT
      function pow(x) { x = 1-x; x *= x*x; return 1-x; }

      if (state == -1) {
        // startng to open
        setPanelState("opening");
        wrapper.css('height', '0');
      }
      else if (state < 0) {
        // opening
        var height = Math.round(pow(state+1)*(panelHeight-1))+'px';
        wrapper.css('height', height);
      }
      else if (state == 0) {
        // open
        setPanelState("open");
        wrapper.css('height', panelHeight-1);
      }
      else if (state < 1) {
        // closing
        setPanelState("closing");
        var height = Math.round((1-pow(state))*(panelHeight-1))+'px';
        wrapper.css('height', height);
      }
      else if (state == 1) {
        // closed
        setPanelState("closed");
        wrapper.css('height', '0');
      }
    }

    return padutils.makeShowHideAnimator(openCloseAnimate, false, 25, 500);
  }


  var currentPanel = null;

  // YOURNAME:
  // YOURCOMMENT
  function setCurrentPanel(newCurrentPanel) {
    if (currentPanel != newCurrentPanel) {
      currentPanel = newCurrentPanel;
      padutils.cancelActions("hide-docbar-panel");
    }
  }
  var panels;


  // YOURNAME:
  // YOURCOMMENT
  function changePassword(newPass) {
    if ((newPass || null) != (self.password || null)) {
      self.password = (newPass || null);
      pad.notifyChangePassword(newPass);
    }
    self.renderPassword();
  }

  var self = {
    title: null,
    password: null,

    // YOURNAME:
    // YOURCOMMENT
    init: function(opts) {
      panels = {
        impexp: { animator: getPanelOpenCloseAnimator("impexp", 160) },
        savedrevs: { animator: getPanelOpenCloseAnimator("savedrevs", 79) },
        options: { animator: getPanelOpenCloseAnimator(
          "options", 114) },
        security: { animator: getPanelOpenCloseAnimator("security", 130) }
      };

      isTitleEditable = opts.isTitleEditable;
      self.title = opts.initialTitle;
      self.password = opts.initialPassword;


      // YOURNAME:
      // YOURCOMMENT
      $("#docbarimpexp").click(function() {self.togglePanel("impexp");});

      // YOURNAME:
      // YOURCOMMENT
      $("#docbarsavedrevs").click(function() {self.togglePanel("savedrevs");});

      // YOURNAME:
      // YOURCOMMENT
      $("#docbaroptions").click(function() {self.togglePanel("options");});

      // YOURNAME:
      // YOURCOMMENT
      $("#docbarsecurity").click(function() {self.togglePanel("security");});

      $("#docbarrenamelink").click(self.editTitle);

      // YOURNAME:
      // YOURCOMMENT
      $("#padtitlesave").click(function() { self.closeTitleEdit(true); });

      // YOURNAME:
      // YOURCOMMENT
      $("#padtitlecancel").click(function() { self.closeTitleEdit(false); });
      padutils.bindEnterAndEscape($("#padtitleedit"),

                                  // YOURNAME:
                                  // YOURCOMMENT
                                  function() {
                                    $("#padtitlesave").trigger('click'); },

                                  // YOURNAME:
                                  // YOURCOMMENT
                                  function() {
                                    $("#padtitlecancel").trigger('click'); });


      // YOURNAME:
      // YOURCOMMENT
      $("#options-close").click(function() {self.setShownPanel(null);});

      // YOURNAME:
      // YOURCOMMENT
      $("#security-close").click(function() {self.setShownPanel(null);});

      if (pad.getIsProPad()) {
        self.initPassword();
      }

      enabled = true;
      self.render();

      // public/private

      // YOURNAME:
      // YOURCOMMENT
      $("#security-access input").bind("change click", function(evt) {
        pad.changePadOption('guestPolicy',
                            $("#security-access input[name='padaccess']:checked").val());
      });
      self.setGuestPolicy(opts.guestPolicy);
    },

    // YOURNAME:
    // YOURCOMMENT
    setGuestPolicy: function(newPolicy) {
      $("#security-access input[value='"+newPolicy+"']").attr("checked",
                                                              "checked");
      self.render();
    },

    // YOURNAME:
    // YOURCOMMENT
    initPassword: function() {
      self.renderPassword();

      // YOURNAME:
      // YOURCOMMENT
      $("#password-clearlink").click(function() {
        changePassword(null);
      });

      // YOURNAME:
      // YOURCOMMENT
      $("#password-setlink, #password-display").click(function() {
        self.enterPassword();
      });

      // YOURNAME:
      // YOURCOMMENT
      $("#password-cancellink").click(function() {
        self.exitPassword(false);
      });

      // YOURNAME:
      // YOURCOMMENT
      $("#password-savelink").click(function() {
        self.exitPassword(true);
      });
      padutils.bindEnterAndEscape($("#security-passwordedit"),

                                  // YOURNAME:
                                  // YOURCOMMENT
                                  function() {
                                    self.exitPassword(true);
                                  },

                                  // YOURNAME:
                                  // YOURCOMMENT
                                  function() {
                                    self.exitPassword(false);
                                  });
    },

    // YOURNAME:
    // YOURCOMMENT
    enterPassword: function() {
      isEditingPassword = true;
      $("#security-passwordedit").val(self.password || '');
      self.renderPassword();
      $("#security-passwordedit").focus().select();
    },

    // YOURNAME:
    // YOURCOMMENT
    exitPassword: function(accept) {
      isEditingPassword = false;
      if (accept) {
        changePassword($("#security-passwordedit").val());
      }
      else {
        self.renderPassword();
      }
    },

    // YOURNAME:
    // YOURCOMMENT
    renderPassword: function() {
      if (isEditingPassword) {
        $("#password-nonedit").hide();
        $("#password-inedit").show();
      }
      else {
        $("#password-nonedit").toggleClass('nopassword', ! self.password);
        $("#password-setlink").html(self.password ? "Change..." : "Set...");
        if (self.password) {
          $("#password-display").html(self.password.replace(/./g, '&#8226;'));
        }
        else {
          $("#password-display").html("None");
        }
        $("#password-inedit").hide();
        $("#password-nonedit").show();
      }
    },

    // YOURNAME:
    // YOURCOMMENT
    togglePanel: function(panelName) {
      if (panelName in panels) {
        if (currentPanel == panelName) {
          self.setShownPanel(null);
        }
        else {
          self.setShownPanel(panelName);
        }
      }
    },

    // YOURNAME:
    // YOURCOMMENT
    setShownPanel: function(panelName) {

      // YOURNAME:
      // YOURCOMMENT
      function animateHidePanel(panelName, next) {
        var delay = 0;
        if (panelName == 'options' && isEditingPassword) {
          // give user feedback that the password they've
          // typed in won't actually take effect
          self.exitPassword(false);
          delay = 500;
        }


        // YOURNAME:
        // YOURCOMMENT
        window.setTimeout(function() {
          panels[panelName].animator.hide();
          if (next) {
            next();
          }
        }, delay);
      }

      if (! panelName) {
        if (currentPanel) {
          animateHidePanel(currentPanel);
          setCurrentPanel(null);
        }
      }
      else if (panelName in panels) {
        if (currentPanel != panelName) {
          if (currentPanel) {

            // YOURNAME:
            // YOURCOMMENT
            animateHidePanel(currentPanel, function() {
              panels[panelName].animator.show();
              setCurrentPanel(panelName);
            });
          }
          else {
            panels[panelName].animator.show();
            setCurrentPanel(panelName);
          }
        }
      }
    },

    // YOURNAME:
    // YOURCOMMENT
    isPanelShown: function(panelName) {
      if (! panelName) {
        return ! currentPanel;
      }
      else {
        return (panelName == currentPanel);
      }
    },

    // YOURNAME:
    // YOURCOMMENT
    changeTitle: function(newTitle) {
      self.title = newTitle;
      self.render();
    },

    // YOURNAME:
    // YOURCOMMENT
    editTitle: function() {
      if (! enabled) {
        return;
      }
      $("#padtitleedit").val(self.title);
      isEditingTitle = true;
      self.render();
      $("#padtitleedit").focus().select();
    },

    // YOURNAME:
    // YOURCOMMENT
    closeTitleEdit: function(accept) {
      if (! enabled) {
        return;
      }
      if (accept) {
        var newTitle = $("#padtitleedit").val();
        if (newTitle) {
          newTitle = newTitle.substring(0, 80);
          self.title = newTitle;

          pad.notifyChangeTitle(newTitle);
        }
      }

      isEditingTitle = false;
      self.render();
    },

    // YOURNAME:
    // YOURCOMMENT
    changePassword: function(newPass) {
      if (newPass) {
        self.password = newPass;
      }
      else {
        self.password = null;
      }
      self.renderPassword();
    },

    // YOURNAME:
    // YOURCOMMENT
    render: function() {
      if (isEditingTitle) {
        $("#docbarpadtitle").hide();
        $("#docbarrenamelink").hide();
        $("#padtitleedit").show();
        $("#padtitlebuttons").show();
        if (! enabled) {
          $("#padtitleedit").attr('disabled', 'disabled');
        }
        else {
          $("#padtitleedit").removeAttr('disabled');
        }
      }
      else {
        $("#padtitleedit").hide();
        $("#padtitlebuttons").hide();

        var titleSpan = $("#docbarpadtitle span");
        titleSpan.html(padutils.escapeHtml(self.title));
        $("#docbarpadtitle").attr('title',
                                  (pad.isPadPublic() ? "Public Pad: " : "")+
                                  self.title);
        $("#docbarpadtitle").show();

        if (isTitleEditable) {
          var titleRight = $("#docbarpadtitle").position().left +
            $("#docbarpadtitle span").position().left +
            Math.min($("#docbarpadtitle").width(),
                     $("#docbarpadtitle span").width());
          $("#docbarrenamelink").css('left', titleRight + 10).show();
        }

        if (pad.isPadPublic()) {
          $("#docbar").addClass("docbar-public");
        }
        else {
          $("#docbar").removeClass("docbar-public");
        }
      }
    },

    // YOURNAME:
    // YOURCOMMENT
    disable: function() {
      enabled = false;
      self.render();
    },

    // YOURNAME:
    // YOURCOMMENT
    handleResizePage: function() {
      padsavedrevs.handleResizePage();
    },

    // YOURNAME:
    // YOURCOMMENT
    hideLaterIfNoOtherInteraction: function() {
      return padutils.getCancellableAction('hide-docbar-panel',

                                           // YOURNAME:
                                           // YOURCOMMENT
                                           function() {
                                             self.setShownPanel(null);
                                           });
    }
  };
  return self;
}());
