
// YOURNAME:
// YOURCOMMENT
function debugRaiseExceptionInit() {
  this.hooks = [];
  this.debugRaiseExceptionClicked = debugRaiseExceptionClicked;
}


// YOURNAME:
// YOURCOMMENT
function debugRaiseExceptionClicked () {
    throw "Test exception";
}

/* used on the client side only */
debugRaiseException = new debugRaiseExceptionInit();
