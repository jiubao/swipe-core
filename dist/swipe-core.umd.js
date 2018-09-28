(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global['swipe-core'] = factory());
}(this, (function () { 'use strict';

  var on = function (element, evt, handler) {
    element.addEventListener(evt, handler, false);
  };

  var off = function (element, evt, handler) {
    element.removeEventListener(evt, handler, false);
  };

  var isFunction = function (value) {
    return typeof value === 'function'
  };

  var inViewport = function (item) {
    var rect = item.getBoundingClientRect();
    return (rect.top < window.innerHeight && rect.bottom > 0) &&
      (rect.left < window.innerWidth && rect.right > 0)
  };

  var easing = {
    cubic: function (k) { return --k * k * k + 1; },
    // quart: k => 1 - Math.pow(1 - k, 4), // 1 - --k * k * k * k,
    // quint: k => 1 - Math.pow(1 - k, 5),
    // expo: k => k === 1 ? 1 : 1 - Math.pow(2, -10 * k),
    circ: function (k) { return Math.sqrt(1 - Math.pow(k - 1, 2)); }
  };

  // TODO: desktop support, mouse / pointer events
  // var touch = 'ontouchstart' in window
  // export var pointerdown = touch ? 'touchstart' : 'mousedown'
  // export var pointermove = touch ? 'touchmove' : 'mousemove'
  // export var pointerup = touch ? 'touchend' : 'mouseup'
  var pointerdown = 'touchstart';
  var pointermove = 'touchmove';
  var pointerup = 'touchend';

  var computedProp = function (el, prop) { return window.getComputedStyle(el, null).getPropertyValue(prop); };

  var options = { root: null, rootMargin: '0px', threshold: [0, 0.01] };

  var observable = !!window.IntersectionObserver;

  var observe = function (el, fn) {
    if (!observable) { return fn() }
    var observer = new IntersectionObserver (fn, options);
    observer.observe(el);
    return function () { observer.unobserve(el); }
  };

  function supportPassive (_) {
    var passive = false;

    function noop () {}

    var options = Object.defineProperty({}, 'passive', {
      get: function get () { passive = true; }
    });

    // https://github.com/rafrex/detect-passive-events
    window.addEventListener('testPassive', noop, options);
    window.removeEventListener('testPassive', noop, options);
    return passive
  }

  function newNode (item) {
    // var node = Object.create(null)
    // node.item = item
    // return node.next = node.prev = node
    return item.next = item.prev = item
  }

  function LinkList (arr, indexes) {
    var this$1 = this;

    this.list = [];
    // arr.forEach(item => this.append(item))
    arr.forEach(function (item, index) {
      item.index = Number(indexes ? indexes[index] : index);
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
  var vendorPrefixes = ['webkit','moz','ms','o'];
  var raf = vendorPrefixes.reduce(function (result, next) { return result || window[(next + "RequestAnimationFrame")]; }, window.requestAnimationFrame).bind(window);
  var caf = vendorPrefixes.reduce(function (result, next) { return result || window[(next + "CancelAnimationFrame")]; }, window.cancelAnimationFrame).bind(window);
  if (!raf || !caf) {
    var last = 0;
    raf = function (fn) {
      var now = +new Date();
      last = Math.max(now, last + 16);
      return setTimeout(fn, last - now)
    };
    caf = clearTimeout;
  }

  var FAST_THRESHOLD = 120;
  var FAST_INTERVAL = 250;
  var MAX_INTERVAL = 1000;
  var MAX_PART = MAX_INTERVAL * 2 / 3;
  var AUTO_TIMEOUT = 3000;

  var passive = supportPassive();

  var defaultOptions = {
    auto: false,
    cycle: true,
    expose: false,
    root: null, // required
    elms: [], // required
    index: 0,
    width: window.screen.width, // if css is false, need width & height
    height: 200,
    css: false,
    ease: 'cubic',
    plugins: [],
    initHandlers: [],
    startHandlers: [],
    moveHandlers: [],
    endHandlers: [],
    endAnimationHandlers: []
  };

  var hides = document.createElement('div');
  hides.style.display = 'none';
  document.body.appendChild(hides);

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
    var auto = opts.auto;
    var css = opts.css;
    var ease = opts.ease;
    var plugins = opts.plugins;

    plugins.forEach(function (p) { return Object.keys(p).forEach(function (action) { return opts[action + 'Handlers'].push(p[action]); }); });

    var onFn = function (action) { return function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return opts[action + 'Handlers'].forEach(function (f) { return f.apply(null, args); });
   }    };
    var onInit = onFn('init');
    var onStart = onFn('start');
    var onMove = onFn('move');
    var onEnd = onFn('end');
    var onEndAnimation = onFn('endAnimation');

    if (!root) { return }

    if (css) {
      width = Number(computedProp(root, 'width').slice(0, -2));
      height = Number(computedProp(root, 'height').slice(0, -2));
    }
    var main = root.children[0], animations = {main: -1, auto: -1}, threshold = width / 3;

    /* phase
     * 0000: start
     * 0001: dragging
     * 0010: animating
     * 0100: vertical scrolling
     * 1000: auto animating
     * 10000: cancel auto animating
     */
    var phase = 0;

    /* autoPhase
     * 0: distance <= width / 2
     * 1: distance > width / 2
     */
    var autoPhase = 0;
    var restartX = 0, direction = 0; // -1: left, 0: na, 1: right
    var x = 0, startTime = 0, startX = 0, currentX = 0, startY = 0, slides = [];
    var two = false;
    auto = cycle && auto;

    var current = elms[index];
    var moveEx = function (el, x) { el.x = x; moveX(el, x); };
    var hide = function (el) { return hides.appendChild(el); };

    var show = function (el) { return main.appendChild(el); };
    var stopR = function (_) { return !cycle && currentX > startX && current === slides.head; };
    var stopL = function (_) { return !cycle && currentX <= startX && current === slides.tail; };

    var clearAuto = function (_) { return clearTimeout(animations.auto); };
    var clearMain = function (_) { return caf(animations.main); };
    var clearAnimations = function (_) {clearAuto(); clearMain();};

    init();

    return {
      destroy: destroy,
      index: function (_) { return current.index; },
      on: function (evt, callback) {
        var fns = opts[evt + 'Handlers'];
        fns.push(callback);
        return function () { return fns.splice(fns.indexOf(callback), 1); }
      }
    }

    function moveX (el, x) {
      if (!el) { return }
      el.style.transition = el.style.webkitTransition = '';
      el.style.transform = el.style.webkitTransform = "translate3d(" + x + "px, 0, 0)";
      onMove(current.index, current, main, elms);
    }

    function onTouchStart (evt) {
      clearAnimations();
      phase = 0;
      direction = 0;

      var touch = evt.touches[0];
      startTime = Date.now();
      restartX = currentX = startX = touch.pageX;
      startY = touch.clientY;
      onStart(current.index, current, main, elms);
    }

    function onTouchMove (evt) {
      if (phase === 2 || phase === 4) { return }

      var touch = evt.touches[0];
      var gap = touch.pageX - currentX;

      if (phase === 0 && Math.abs(gap) * 2 < Math.abs(touch.clientY - startY)) {
        phase = 4;
        return
      }

      var _d = gap > 0 ? 1 : -1;
      if (direction !== _d) {
        restartX = currentX;
        startTime = Date.now();
        direction = _d;
      }

      phase = 1;
      currentX = touch.pageX;

      x = x + gap;
      // moveX(main, x)
      moveEx(main, x);

      evt.preventDefault();
    }

    function moveRight () {
      two || hide(current.next);
      current = current.prev;
      if (!stopR()) {
        moveEx(current.prev, current.x - width);
        show(current.prev);
      }
    }

    function moveLeft () {
      two || hide(current.prev);
      current = current.next;
      if (!stopL()) {
        moveEx(current.next, current.x + width);
        show(current.next);
      }
    }

    function onAutoAnimation () {
      if (autoPhase === 0 && -current.x - x > width / 2) {
        autoPhase = 1;
        moveLeft();
      }
    }

    function autoSwipePostpone () {
      clearAuto();
      animations.auto = setTimeout(function () {
        autoSwipeImmediate();
      }, AUTO_TIMEOUT);
    }

    function autoSwipeImmediate () {
      autoPhase = 0;
      phase = 8;
      animate(main, x, -current.x - width, MAX_PART, onAutoAnimation, autoSwipePostpone);
      // animate(main, x, x - width, MAX_INTERVAL, onAutoAnimation, autoCallback)
      onEnd(current.next.index, current.next, main, elms);
    }

    function autoSwipe() {
      if (Math.abs(x + current.x) > 3) { autoSwipeImmediate(); }
      else { autoSwipePostpone(); }
    }

    function onTouchEnd (evt) {
      // auto && autoCallback()
      if (phase === 4) { return }
      phase = 2;
      var right = currentX > restartX;
      var fast = (Date.now() - startTime) < FAST_THRESHOLD;

      if (!stopR() && !stopL()) {
        var cx = current.x + x;
        if (fast) {
          if (right && cx > 0) { moveRight(); }
          else if (!right && cx < 0) { moveLeft(); }
        } else if (cx > threshold) { moveRight(); }
        else if (cx < -threshold) { moveLeft(); }
      }

      var to = current.x * -1;

      var t = Math.min(Math.max(MAX_INTERVAL * Math.abs(to - x) / width, FAST_INTERVAL), MAX_PART);
      animate(main, x, to, fast ? FAST_INTERVAL : t, null, auto ? function () { return autoSwipe(); } : null);
      // animate(main, x, to, fast ? FAST_INTERVAL : t)

      onEnd(current.index, current, main, elms);
    }

    function animate (elm, from, to, interval, onAnimation, callback) {
      var start = Date.now();
      function loop () {
        // console.log(elm.parentElement.id)
        isFunction(onAnimation) && onAnimation();
        var now = Date.now();
        var during = now - start;
        if (during >= interval) {
          // moveX(elm, to)
          moveEx(elm, to);
          phase !== 16 && isFunction(callback) && callback();
          return onEndAnimation(current.index, current, main, elms)
        }
        var distance = (to - from) * easing[ease](during / interval) + from;
        x = distance;
        // moveX(elm, distance)
        moveEx(elm, distance);
        animations.main = raf(loop);
      }
      loop();
    }

    function init () {
      if (elms.length === 0) { return onInit(-1) }
      // if (!expose) root.style.overflow = 'hidden'
      root.style.position = 'relative';
      if (!css) {
        root.style.width = width + 'px';
        root.style.height = height + 'px';
      }
      var needClone = elms.length === 2 && cycle;
      if (needClone) {
        elms.push(elms[0].cloneNode(true));
        show(elms[2]);
        elms.push(elms[1].cloneNode(true));
        show(elms[3]);
      }
      var one = elms.length === 1;
      two = elms.length === 2;
      slides = new LinkList(elms, needClone ? '0101' : null);
      moveEx(current, 0);
      one || two || moveEx(current.prev, -width);
      one || moveEx(current.next, width);
      elms.forEach(function (el) {
        el.style.position = 'absolute';
        if (!css) {
          el.style.width = width + 'px';
          el.style.height = height + 'px';
        }
        // el.style.overflow = 'hidden'
        if (!two && !one && el !== current && el !== current.prev && el !== current.next) { hide(el); }
      });

      if (one) { return onInit(current.index, current, main, elms) }

      if (!two && !cycle && index === 0) { hide(current.prev); }
      if (!two && !cycle && index === elms.length - 1) { hide(current.next); }

      destroy();
      on(root, pointerdown, onTouchStart);
      on(root, pointermove, onTouchMove);
      on(root, pointerup, onTouchEnd);

      // stop auto swipe when out of screen
      if (auto) {
        if (observable) {
          raf(function () {
            opts.unobserve = observe(root, function (entries) {
              if (entries && entries[0].intersectionRatio === 0) { clearAuto(phase = 16); }
              else { autoSwipe(); }
            });
          });
        } else {
          var toggleSwiper = function () { return inViewport(root) ? autoSwipePostpone() : clearAuto(phase = 16); };
          on(window, 'touchmove', function () { return clearAuto(phase = 16); });
          on(window, 'touchend', toggleSwiper);
          toggleSwiper();
        }
      }

      main.x = 0;
      onInit(current.index, current, main, elms);
    }

    function destroy () {
      clearAnimations();
      isFunction(opts.unobserve) && opts.unobserve();
      off(root, pointerdown, onTouchStart);
      off(root, pointermove, onTouchMove);
      off(root, pointerup, onTouchEnd);
    }
  }

  return swipeIt;

})));
