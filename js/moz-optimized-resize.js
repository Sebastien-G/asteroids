'use strict';

(function() {
  /*
  https://developer.mozilla.org/en-US/docs/Web/Events/resize
  */
/*
  (function() {

    window.addEventListener("resize", resizeThrottler, false);

    var resizeTimeout;
    function resizeThrottler() {
      // ignore resize events as long as an actualResizeHandler execution is in the queue
      if ( !resizeTimeout ) {
        resizeTimeout = setTimeout(function() {
          resizeTimeout = null;
          actualResizeHandler();

         // The actualResizeHandler will execute at a rate of 15fps
         }, 66);
      }
    }

    function actualResizeHandler() {
      // handle the resize event
    }

  }());
*/


  var throttle = function(type, name, obj) {
    obj = obj || window;
    var running = false;

    var func = function() {
      if (running) { return; }
      running = true;
      requestAnimationFrame(function() {
        obj.dispatchEvent(new CustomEvent(name));
        running = false;
      });
    };

    obj.addEventListener(type, func);
  };

  // init - you can init any event
  throttle('resize', 'optimizedResize');

})();
