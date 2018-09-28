(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.swipeCorePlugin3d = factory());
}(this, (function () { 'use strict';

  const transformPx = x => document.documentElement.clientWidth * x / 375;

  var _3d = (options) => {
    var defaultOptions = {
      perspective: 500,
      ztuning: 140,
      // width: 768,
      // height: 320
      width: 384,
      height: 160
    };
    var opts = {...defaultOptions, ...options};
    // opts.width = opts.width / 2
    // opts.height = opts.height / 2

    var perspectiveOriginY = transformPx(opts.height) / 2 + 'px';

    function setZ (current, main) {
      main.style.webkitPerspectiveOriginX = -main.x + transformPx(opts.width) / 2 + 'px';
      main.style.perspectiveOrigin = -main.x + transformPx(opts.width) / 2 + 'px ' + perspectiveOriginY;
      var cs = main.children;
      var s = main.x;
      var x = current.x;
      var gap = Math.abs(x + s);
      current.style.transform = `translate3d(${x}px, 0px, -${gap / 3}px)`;

      for (var i = 0; i < cs.length; i++) {
        var c = cs[i];
        var x = c.x;
        if (c !== current) {
          c.style.transform = `translate3d(${x}px, 0px, -${140 - gap / 3}px)`;
        }
      }
    }

    return {
      init: (_, current, main) => {
        main.style.perspective = opts.perspective + 'px';
        main.style.webkitPerspectiveOriginY = perspectiveOriginY;
        setZ(current, main);
      },
      move: (_, current, main) => setZ(current, main)
    }
  }

  return _3d;

})));
