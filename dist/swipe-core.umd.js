(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global['swipe-core'] = factory());
}(this, (function () { 'use strict';

  function on (element, evt, handler) {
    element.addEventListener(evt, handler, false);
  }

  function off (element, evt, handler) {
    element.removeEventListener(evt, handler, false);
  }

  function isFunction (value) {
    return typeof value === 'function'
  }

  function newNode (item) {
    // var node = Object.create(null)
    // node.item = item
    // return node.next = node.prev = node
    return item.next = item.prev = item
  }

  function LinkList (arr) {
    var this$1 = this;

    this.list = [];
    // arr.forEach(item => this.append(item))
    arr.forEach(function (item, index) {
      item.index = index;
      this$1.append(item);
    });
  }

  LinkList.prototype.append = function (item) {
    var node = newNode(item);
    this.list.push(node);
    if (!this.tail) {
      return this.head = this.tail = node
    }
    node.prev = this.tail;
    node.next = this.tail.next;
    this.tail.next = node;
    node.next.prev = node;
    return this.tail = node
  };

  // for a 60Hz monitor, requestAnimationFrame will trigger the callback every 16.67ms (1000 / 60 == 16.66...)
  // todo: for performance concern, add threshold, to control how many times fn will be called in one minute
  // var ticking = false
  // export function requestFrame (fn, giveup) {
  //   if (!giveup || !ticking) {
  //     window.requestAnimationFrame(() => {
  //       ticking = false
  //       fn()
  //     })
  //     ticking = true
  //   }
  // }
  var requestFrame = window.requestAnimationFrame;
  var cancelFrame = window.cancelAnimationFrame;

  var cubic = function (k) { return --k * k * k + 1; };

  var defaultOptions = {
    interval: 500,
    cycle: true,
    expose: false,
    root: null, // required
    elms: [], // required
    index: 0,
    width: 375, // required
    height: 100 // required
  };

  function swipeIt (options) {
    var opts = Object.assign({}, defaultOptions,
      options);

    var index = opts.index;
    var root = opts.root;
    var elms = opts.elms;
    var width = opts.width;
    var height = opts.height;
    var cycle = opts.cycle;
    var expose = opts.expose;
    var interval = opts.interval;

    if (!root) { return }

    var main = root.children[0], hide = document.createElement('div'), animations = {main: -1}, threshold = width / 3;

    /*
     * 0000: stop
     * 0001: dragging
     * 0010: animating
     * 0100: vertical scrolling
     */
    var phase = 0;
    var x = 0, startTime = 0, startX = 0, currentX = 0, startY = 0, currentY = 0, slides = []; //, left = 0

    var current = elms[index];

    init();

    return {
      init: init
    }

    function onTouchStart (evt) {
      if (phase === 4) { return }

      if (phase === 2) {
        // while (animations.length) animations.splice(0, 1)[0]()
        cancelFrame(animations.main);
      }
      phase = 0;

      var touch = evt.touches[0];
      startTime = Date.now();
      currentX = startX = touch.pageX;
      currentY = startY = touch.clientY;
    }

    function onTouchMove (evt) {
      if (phase === 2 || phase === 4) { return }

      var touch = evt.touches[0];
      var _gap = touch.pageX - currentX;
      currentX = touch.pageX;
      currentY = touch.clientY;
      x = x + _gap;

      moveX(main, x);

      evt.preventDefault();
    }

    // function _onTouchMove (evt) {
    //   if (phase === 2 || phase === 4) return
    //
    //   var touch = evt.touches[0]
    //   currentX = touch.pageX
    //   currentY = touch.clientY
    //   var _gap = gap()
    //   var right = _gap >= 0
    //
    //   phase = 1
    //
    //   // if (phase === 0) {
    //   //   var x = Math.abs(_gap)
    //   //   var y = Math.abs(currentY - startY)
    //   //   if (x * 2 < y) {
    //   //     phase = 4
    //   //     return
    //   //   }
    //   //
    //   //   phase = 1
    //   // }
    //
    //   evt.preventDefault();
    //
    //   // left = left + _gap
    //
    //   console.log('onmove.left: ', left)
    //   // console.log('onmove.lastgap: ', lastGap)
    //   console.log('onmove.gap: ', _gap)
    //   moveX(main, left + _gap);
    // }

    // 375, 187, 188
    function onTouchEnd (evt) {
      phase = 2;
      var right = (currentX - startX) >= 0;
      var fast = (Date.now() - startTime) < 200;

      var cx = current.x + x;
      if (cx > threshold || (fast && right)) {
        hide.appendChild(current.next);
        current = current.prev;
        current.prev.x = current.x - width;
        moveX(current.prev, current.prev.x);
        main.appendChild(current.prev);
      } else if (cx < -threshold || (fast && !right)) {
        hide.appendChild(current.prev);
        current = current.next;
        current.next.x = current.x + width;
        moveX(current.next, current.next.x);
        main.appendChild(current.next);
      }
      animate(main, x, current.x * -1, fast ? 150 : interval);
    }

    // function _onTouchEnd (evt) {
    //   return
    //   if (phase === 4 || phase === 2) return
    //   phase = 2
    //
    //   var _gap = gap()
    //   if (_gap === 0) return
    //   var right = _gap >= 0
    //   lastGap = _gap
    //
    //   var abort = shouldCancel();
    //   console.log('end.abort: ', abort)
    //   var from = _gap + left
    //   var nextleft = abort ? left : left + width * (right ? 1 : -1);
    //   animate(main, from, nextleft, callback)
    //
    //   function callback () {
    //     console.log('callback....')
    //     if (!abort) {
    //       left = nextleft
    //       hide.appendChild(right ? next() : prev());
    //       current = current[right ? 'prev' : 'next'];
    //       var target = right ? prev() : next()
    //       moveX(target, width * (right ? -1 : 1) - left)
    //       main.appendChild(target)
    //     }
    //     phase = 0;
    //     lastGap = 0
    //   }
    // }

    function animate (elm, from, to, interval, callback) {
      var start = Date.now();
      function loop () {
        var now = Date.now();
        var during = now - start;
        if (during >= interval) {
          moveX(elm, to);
          isFunction(callback) && callback();
          return
        }
        var distance = (to - from) * cubic(during / interval) + from;
        // lastGap = distance - left
        x = distance;
        moveX(elm, distance);
        animations.main = requestFrame(loop);
      }
      loop();
    }

    // function shouldCancel () {
    //   var _gap = gap()
    //   var right = _gap >= 0
    //   var cancel = Math.abs(_gap) < width / 3
    //   var endTime = Date.now()
    //   var duration = endTime - startTime
    //
    //   return ((duration > 300 || duration < 16) && cancel) || (!cycle && right && current === slides.head) || (!cycle && !right && current === slides.tail)
    // }

    function init () {
      hide.style.display = 'none';
      document.body.appendChild(hide);
      slides = new LinkList(elms);
      elms.forEach(function (el, i) {
        switch (el) {
          case current:
            moveX(el, 0);
            el.x = 0;
            break;
          case current.prev:
            moveX(el, -width);
            el.x = -width;
            break;
          case current.next:
            moveX(el, width);
            el.x = width;
            break;
          default:
            hide.appendChild(el);
        }
      });

      destroy();
      on(root, 'touchstart', onTouchStart);
      on(root, 'touchmove', onTouchMove);
      on(root, 'touchend', onTouchEnd);
    }

    function destroy () {
      off(root, 'touchstart', onTouchStart);
      off(root, 'touchmove', onTouchMove);
      off(root, 'touchend', onTouchEnd);
    }
  }

  function moveX (el, x) {
    if (!el) { return }
    el.style.webkitTransition = '';
    el.style.webkitTransform = "translate3d(" + x + "px, 0, 0)";
  }

  return swipeIt;

})));
