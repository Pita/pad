
// YOURNAME:
// YOURCOMMENT
function showImagesInit() {
  this.hooks = ['aceGetFilterStack', 'aceCreateDomLine'];
  this.aceGetFilterStack = aceGetFilterStack;
  this.aceCreateDomLine = aceCreateDomLine;
}


// YOURNAME:
// YOURCOMMENT
function aceGetFilterStack(args) {
  return [
//    args.linestylefilter.getRegexpFilter(
//      new RegExp("#[^,#=!\\s][^,#=!\\s]*", "g"), 'padtag'),
    args.linestylefilter.getRegexpFilter(
      new RegExp("http.+((\.png)|(\.jpg))", "g"), 'image')
  ];
}


// YOURNAME:
// YOURCOMMENT
function aceCreateDomLine(args) {
  if (args.cls.indexOf('image') > -1) {
    var src;

    // YOURNAME:
    // YOURCOMMENT
    cls = args.cls.replace(/(^| )image:(\S+)/g, function(x0, space, image) {
      src = image;
      return space + "image image_" + image;
    });

   return [{
   		cls: cls,
   		extraOpenTags: '<img src="' + src + '" width="500px"/>',
		extraCloseTags:''
   	}];
  }
  
//   else if (args.cls.indexOf('padtag') >= 0) {
//    var href;

// YOURNAME:
// YOURCOMMENT
//    cls = args.cls.replace(/(^| )padtag:(\S+)/g, function(x0, space, padtag) {
//      href = '/ep/tag/?query=' + padtag.substring(1);
//      return space + "padtag padtag_" + padtag.substring(1);
//    });
//
//   return [{
//     cls: cls,
//     extraOpenTags: '<strong><a href="' + href.replace(/\"/g, '&quot;') + '">',
//     extraCloseTags: '</a></strong>'}];
//  }
}
showImages = new showImagesInit();
