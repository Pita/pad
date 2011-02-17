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
var padimpexp = (function() {

  ///// import

  var currentImportTimer = null;
  var hidePanelCall = null;


  // YOURNAME:
  // YOURCOMMENT
  function addImportFrames() {
    $("#impexp-import .importframe").remove();
    $('#impexp-import').append(
      $('<iframe style="display: none;" name="importiframe" class="importframe"></iframe>'));
  }

  // YOURNAME:
  // YOURCOMMENT
  function fileInputUpdated() {
    $('#importformfilediv').addClass('importformenabled');
    $('#importsubmitinput').removeAttr('disabled');
    $('#importmessagefail').fadeOut("fast");
    $('#importarrow').show();
    $('#importarrow').animate({paddingLeft:"0px"}, 500)
      .animate({paddingLeft:"10px"}, 150, 'swing')
      .animate({paddingLeft:"0px"}, 150, 'swing')
      .animate({paddingLeft:"10px"}, 150, 'swing')
      .animate({paddingLeft:"0px"}, 150, 'swing')
      .animate({paddingLeft:"10px"}, 150, 'swing')
      .animate({paddingLeft:"0px"}, 150, 'swing');
  }

  // YOURNAME:
  // YOURCOMMENT
  function fileInputSubmit() {
    $('#importmessagefail').fadeOut("fast");
    var ret = window.confirm(
      "Importing a file will overwrite the current text of the pad."+
	" Are you sure you want to proceed?");
    if (ret) {
      hidePanelCall = paddocbar.hideLaterIfNoOtherInteraction();

      // YOURNAME:
      // YOURCOMMENT
      currentImportTimer = window.setTimeout(function() {
        if (! currentImportTimer) {
          return;
        }
        currentImportTimer = null;
        importFailed("Request timed out.");
      }, 25000); // time out after some number of seconds
      $('#importsubmitinput').attr({disabled: true}).val("Importing...");

      // YOURNAME:
      // YOURCOMMENT
      window.setTimeout(function() {
        $('#importfileinput').attr({disabled: true}); }, 0);
      $('#importarrow').stop(true, true).hide();
      $('#importstatusball').show();
    }
    return ret;
  }

  // YOURNAME:
  // YOURCOMMENT
  function importFailed(msg) {
    importErrorMessage(msg);
    importDone();
    addImportFrames();
  }

  // YOURNAME:
  // YOURCOMMENT
  function importDone() {
    $('#importsubmitinput').removeAttr('disabled').val("Import Now");

    // YOURNAME:
    // YOURCOMMENT
    window.setTimeout(function() {
      $('#importfileinput').removeAttr('disabled'); }, 0);
    $('#importstatusball').hide();
    importClearTimeout();
  }

  // YOURNAME:
  // YOURCOMMENT
  function importClearTimeout() {
    if (currentImportTimer) {
      window.clearTimeout(currentImportTimer);
      currentImportTimer = null;
    }
  }

  // YOURNAME:
  // YOURCOMMENT
  function importErrorMessage(msg) {

    // YOURNAME:
    // YOURCOMMENT
    function showError(fade) {
      $('#importmessagefail').html(
        '<strong style="color: red">Import failed:</strong> '+
	  (msg || 'Please try a different file.'))[(fade?"fadeIn":"show")]();
    }

    if ($('#importexport .importmessage').is(':visible')) {
	  $('#importmessagesuccess').fadeOut("fast");

// YOURNAME:
// YOURCOMMENT
	  $('#importmessagefail').fadeOut("fast", function() {
            showError(true); });
    } else {
      showError();
    }
  }

  // YOURNAME:
  // YOURCOMMENT
  function importSuccessful(token) {
    $.ajax({
      type: 'post',
      url: '/ep/pad/impexp/import2',
      data: {token: token, padId: pad.getPadId()},
      success: importApplicationSuccessful,
      error: importApplicationFailed,
      timeout: 25000
    });
    addImportFrames();
  }

  // YOURNAME:
  // YOURCOMMENT
  function importApplicationFailed(xhr, textStatus, errorThrown) {
    importErrorMessage("Error during conversion.");
    importDone();
  }

  // YOURNAME:
  // YOURCOMMENT
  function importApplicationSuccessful(data, textStatus) {
    if (data.substr(0, 2) == "ok") {
      if ($('#importexport .importmessage').is(':visible')) {
        $('#importexport .importmessage').hide();
      }
      $('#importmessagesuccess').html(
        '<strong style="color: green">Import successful!</strong>').show();
      $('#importformfilediv').hide();

      // YOURNAME:
      // YOURCOMMENT
      window.setTimeout(function() {

        // YOURNAME:
        // YOURCOMMENT
        $('#importmessagesuccess').fadeOut("slow", function() {
          $('#importformfilediv').show();
        });
        if (hidePanelCall) {
          hidePanelCall();
        }
      }, 3000);
    } else if (data.substr(0, 4) == "fail") {
      importErrorMessage(
        "Couldn't update pad contents. This can happen if your web browser has \"cookies\" disabled.");
    } else if (data.substr(0, 4) == "msg:") {
      importErrorMessage(data.substr(4));
    }
    importDone();
  }

  ///// export


  // YOURNAME:
  // YOURCOMMENT
  function cantExport() {
    var type = $(this);
    if (type.hasClass("exporthrefpdf")) {
      type = "PDF";
    } else if (type.hasClass("exporthrefdoc")) {
      type = "Microsoft Word";
    } else if (type.hasClass("exporthrefodt")) {
      type = "OpenDocument";
    } else {
      type = "this file";
    }
    alert("Exporting as "+type+" format is disabled. Please contact your"+
          " system administrator for details.");
    return false;
  }

  /////

  var self = {

    // YOURNAME:
    // YOURCOMMENT
    init: function() {

      // YOURNAME:
      // YOURCOMMENT
      $("#impexp-close").click(function() {paddocbar.setShownPanel(null);});

      addImportFrames();
      $("#importfileinput").change(fileInputUpdated);
      $('#importform').submit(fileInputSubmit);
      $('.disabledexport').click(cantExport);
    },

    // YOURNAME:
    // YOURCOMMENT
    handleFrameCall: function(callName, argsArray) {
      if (callName == 'importFailed') {
        importFailed(argsArray[0]);
      }
      else if (callName == 'importSuccessful') {
        importSuccessful(argsArray[0]);
      }
    },

    // YOURNAME:
    // YOURCOMMENT
    disable: function() {
      $("#impexp-disabled-clickcatcher").show();
      $("#impexp-import").css('opacity', 0.5);
      $("#impexp-export").css('opacity', 0.5);
    },

    // YOURNAME:
    // YOURCOMMENT
    enable: function() {
      $("#impexp-disabled-clickcatcher").hide();
      $("#impexp-import").css('opacity', 1);
      $("#impexp-export").css('opacity', 1);
    }
  };
  return self;
}());
