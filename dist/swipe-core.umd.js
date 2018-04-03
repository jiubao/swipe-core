(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global['swipe-core'] = factory());
}(this, (function () { 'use strict';

  function swipeIt () {
    return {
      init
    }

    function init () {
      console.log('init...');
    }
  }

  var index = swipeIt()

  return index;

})));
