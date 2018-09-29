(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.swipeCorePluginTransparent = factory());
}(this, (function () { 'use strict';

  var transparent = width => {
    // width = width / 2
    let threshold = 0.6;
    const opacity = (el, val) => el.style.opacity = val;
    const setTwo = (current, val) => {
      if (current.$next !== current) opacity(current.$next, val);
      if (current.$prev !== current) opacity(current.$prev, val);
    };
    const reset = current => {
      opacity(current, 1);
      setTwo(current, threshold);
    };

    return {
      init: (_, current) => {
        reset(current);
      },
      move: (_, current, main) => {
        var gap = Math.abs(main.x + current.x);
        opacity(current, 1 - (1 - threshold) * gap / width);
        setTwo(current, threshold + (1 - threshold) * gap / width);
      },
      endAnimation: (_, current) => {
        reset(current);
      }
    }
  }

  return transparent;

})));
