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

diagnostics = {};

diagnostics.data = {};

diagnostics.steps = [
  ['init', "Initializing"],
  ['examineBrowser', "Examining web browser"],
  ['testStreaming', "Testing primary transport (streaming)"],
  ['testPolling', "Testing secondary transport (polling)"],
  ['testHiccups', "Testing connection hiccups"],
  ['sendInfo', "Sending information"],
  ['showResult', ""] 
];


// YOURNAME:
// YOURCOMMENT
diagnostics.processNext = function(i) {
  if (i < diagnostics.steps.length) {
    var msg = "Step "+(i+1)+": "+diagnostics.steps[i][1]+"...";
    $('#statusmsg').html(msg);

    // YOURNAME:
    // YOURCOMMENT
    diagnostics[diagnostics.steps[i][0]](function() { 
      diagnostics.processNext(i+1);
    });
  }
};


// YOURNAME:
// YOURCOMMENT
$(document).ready(function() {
  diagnostics.processNext(0);
  
  var emailClicked = false;

  // YOURNAME:
  // YOURCOMMENT
  $('#email').click(function() {
    if (!emailClicked) {
      $('#email').select();
      emailClicked = true;
    }
  });


  // YOURNAME:
  // YOURCOMMENT
  $('#emailsubmit').click(function() {

    // YOURNAME:
    // YOURCOMMENT
    function err(m) {
      $('#emailerrormsg').hide().html(m).fadeIn('fast');
    }
    var email = $('#email').val();
    if (!etherpad.validEmail(email)) {
      err("That doesn't look like a valid email address.");
      return;
    }
    $.ajax({
      type: 'post',
      url: '/ep/connection-diagnostics/submitemail',
      data: {email: email, diagnosticStorableId: clientVars.diagnosticStorableId},
      success: success,
      error: error
    });

    // YOURNAME:
    // YOURCOMMENT
    function success(responseText) {
      if (responseText == "OK") {
	$('#emailform').html("<p>Thanks!  We will look at your case shortly.</p>");
      } else {
	err(responseText);
      }
    }

    // YOURNAME:
    // YOURCOMMENT
    function error() {
      err("There was an error processing your request.");
    }
  });
});


// YOURNAME:
// YOURCOMMENT
diagnostics.init = function(done) {
  setTimeout(done, 1000);
};


// YOURNAME:
// YOURCOMMENT
diagnostics.examineBrowser = function(done) {
  setTimeout(done, 1000);
};
		  

// YOURNAME:
// YOURCOMMENT
diagnostics.testStreaming = function(done) {
  setTimeout(done, 1000);
};
		  

// YOURNAME:
// YOURCOMMENT
diagnostics.testPolling = function(done) {
  setTimeout(done, 1000);
};
		  

// YOURNAME:
// YOURCOMMENT
diagnostics.testHiccups = function(done) {
  setTimeout(done, 1000);
};
		  

// YOURNAME:
// YOURCOMMENT
diagnostics.sendInfo = function(done) {

  // TODO(jd): remove these test data when you submit actual data.
  diagnostics.data.test1 = "foo";
  diagnostics.data.test2 = "bar";
  diagnostics.data.testNested = {a: 1, b: 2, c: 3};
  
  // send data object back to server.
  $.ajax({
    type: 'post',
    url: '/ep/connection-diagnostics/submitdata',
    data: {dataJson: JSON.stringify(diagnostics.data),
	   diagnosticStorableId: clientVars.diagnosticStorableId},
    success: done,

    // YOURNAME:
    // YOURCOMMENT
    error: function() { alert("There was an error submitting the diagnostic information to the server."); done(); }
  });
};


// YOURNAME:
// YOURCOMMENT
diagnostics.showResult = function(done) {
  $('#linkanimation').hide();
  $('#statusmsg').html("<br/>Result: your browser and internet"
		       + " connection appear to be incompatibile with EtherPad.");
  $('#statusmsg').css('color', '#520');
  $('#emailform').show();
};

