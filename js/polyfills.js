'use strict';

/*
requestAnimationFrame

http://paulirish.com/2011/requestanimationframe-for-smart-animating/
http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
refactored by Yannick Albert (https://gist.github.com/yckart/5486197)

MIT license
*/
(function(c){var b="equestAnimationFrame",f="r"+b,a="ancelAnimationFrame",e="c"+a,d=0,h=["moz","ms","o","webkit"],g;while(!c[f]&&(g=h.pop())){c[f]=c[g+"R"+b];c[e]=c[g+"C"+a]||c[g+"CancelR"+b]}if(!c[f]){c[f]=function(l){var k=new Date().getTime(),i=16-(k-d),j=i>0?i:0;d=k+j;return setTimeout(function(){l(d)},j)};c[e]=clearTimeout}}(this));
/*
End: requestAnimationFrame
*/


/*
Math.sign

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign#Using_Math.sign()
*/
Math.sign = Math.sign || function(x) {
  x = +x; // convert to a number
  if (x === 0 || isNaN(x)) {
    return x;
  }
  return x > 0 ? 1 : -1;
}
/*
End: Math.sign
*/


/*
String.prototype.trim
*/
if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
  }
}
/*
End: String.prototype.trim
*/


/*
Array.isArray
*/
if(typeof Array.isArray !== 'function') {
  Array.isArray = function(value) {
    return Array.prototype.toString.apply(value) === '[object Array]';
  };
}
/*
End: String.prototype.trim
*/
