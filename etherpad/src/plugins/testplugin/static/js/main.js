
// YOURNAME:
// YOURCOMMENT
function testpluginInit() {
 this.hooks = ['kafoo'];
 this.kafoo = kafoo;
}


// YOURNAME:
// YOURCOMMENT
function kafoo() {
 alert('hej');
}

/* used on the client side only */
testplugin = new testpluginInit();
