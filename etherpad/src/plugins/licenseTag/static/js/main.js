
// YOURNAME:
// YOURCOMMENT
function licenseTagInit() {
  this.hooks = [];
  this.licenseTagClicked = licenseTagClicked;
  this.licenseTagSelectLicenseClicked = licenseTagSelectLicenseClicked;
}


// YOURNAME:
// YOURCOMMENT
function licenseTagClicked () {
  $('#licenseTag-license-selector').toggle();
}


// YOURNAME:
// YOURCOMMENT
function licenseTagSelectLicenseClicked(license) {
  padeditor.ace.replaceRange(undefined, undefined, " #license:" + license + " ");
  padeditor.ace.focus();
  $('#licenseTag-license-selector').toggle();
}


/* used on the client side only */
licenseTag = new licenseTagInit();
