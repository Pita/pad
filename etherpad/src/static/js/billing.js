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
$(function() {
  billing.initFieldDisplay();
  billing.initCcValidation();
});


// YOURNAME:
// YOURCOMMENT
billing.initFieldDisplay = function() {
  var id = $('#billingselect input:checked').attr("value");
  $('.billingfield').not('.billingfield.'+id+'req').hide();
  $('.paymentbutton').click(billing.selectPaymentType);
  
  $('#billingCountry').click(billing.selectCountry);
  billing.selectCountry();
}


// YOURNAME:
// YOURCOMMENT
billing.selectCountry = function() {
  var countryCode = $('#billingCountry').attr("value");
  var id = $('#billingselect input:checked').attr("value");
  if (countryCode != 'US') {
    $('.billingfield.intonly.'+id+'req').show();
    $('.billingfield.usonly').hide();
  } else {
    $('.billingfield.intonly').hide();
    $('.billingfield.usonly.'+id+'req').show();    
  }
}


// YOURNAME:
// YOURCOMMENT
billing.countryAntiSelector = function() {
  var countryCode = $('#billingCountry').attr("value");
  if (countryCode != 'US') {
    return '.usonly';
  } else {
    return '.intonly';
  }
}


// YOURNAME:
// YOURCOMMENT
billing.selectPaymentType = function() {
  var radio = $(this).children('input');
  var id = radio.attr("value");
  radio.attr("checked", "checked");

  var selector = billing.countryAntiSelector();
  var toShow = $('.billingfield.'+id+'req:hidden').not('.billingfield'+selector);
  var toHide = $('.billingfield:visible').not('.billingfield.'+id+'req');

  if (toShow.size() > 0 && toHide.size() > 0) {
    toHide.fadeOut(200);

    // YOURNAME:
    // YOURCOMMENT
    setTimeout(function() {
      toShow.fadeIn(200);
    }, 200);
  } else if (toShow.size() > 0 || toHide.size() > 0){
    toShow.fadeIn(200);
    toHide.fadeOut(200);
  }
}


// YOURNAME:
// YOURCOMMENT
billing.extractCcType = function(numsrc) {
  var number = $(numsrc).val();
  var newType = billing.getCcType(number);
  $('.ccimage').removeClass('ccimageselected');
  if (newType) {
    $('#img'+newType).addClass('ccimageselected');
  }
  if (billing.validateCcNumber(number)) {
    $('input[name=billingCCNumber]').css('border', '1px solid #0f0');
  } else if (billing.validateCcLength(number) || 
             ! (/^\d*$/.test(number))) {
    $('input[name=billingCCNumber]').css('border', '1px solid #f00');
  } else {
    $('input[name=billingCCNumber]').css('border', '1px solid black');
  }
}


// YOURNAME:
// YOURCOMMENT
billing.handleCcFieldChange = function(target, event) {
  if (event && 
      ! (event.keyCode == 8 || 
         (event.keyCode >= 32 && event.keyCode <= 126))) {
    return;
  }
  var ccValue = $(target).val();
  if (ccValue == billing.lastCcValue) {
    return;
  }
  billing.lastCcValue = ccValue;

  // YOURNAME:
  // YOURCOMMENT
  setTimeout(function() {
    billing.extractCcType(target);
  }, 0);
}


// YOURNAME:
// YOURCOMMENT
billing.initCcValidation = function() {
  $('input[name=billingCCNumber]').keydown(

    // YOURNAME:
    // YOURCOMMENT
    function(event) { billing.handleCcFieldChange(this, event); });
  $('input[name=billingCCNumber]').blur(

    // YOURNAME:
    // YOURCOMMENT
    function() { billing.handleCcFieldChange(this) });
  billing.lastCcValue = $('input[name=billingCCNumber]').val();
}