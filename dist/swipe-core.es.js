import supportPassive from '@jiubao/passive';
import Link from '@jiubao/link';
import { raf, caf } from '@jiubao/raf';

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

// export const requestFrame = fn => {
//   var ticking = false
//   return () => {
//     if (!ticking) {
//       raf(() => {
//         fn()
//         ticking = false
//       })
//       ticking = true
//     }
//   }
// }

// // Set the name of the hidden property and the change event for visibility
// var hidden, visibilityChange;
// if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
//   hidden = "hidden";
//   visibilityChange = "visibilitychange";
// } else if (typeof document.msHidden !== "undefined") {
//   hidden = "msHidden";
//   visibilityChange = "msvisibilitychange";
// } else if (typeof document.webkitHidden !== "undefined") {
//   hidden = "webkitHidden";
//   visibilityChange = "webkitvisibilitychange";
// }

// export {hidden, visibilityChange}

// // If the page is hidden, pause the video;
// // if the page is shown, play the video
// function handleVisibilityChange() {
//   if (document[hidden]) {
//     clearAuto(phase = 16)
//   } else {
//     autoSwipePostpone()
//   }
// }
//
// // Handle page visibility change
// document.addEventListener(visibilityChange, handleVisibilityChange, false);

function bitEnum () {
  this.value = 0;
}
bitEnum.prototype = {
  is: function (v) {
    return this.value & v
  },
  or: function (v) {
    this.value = this.value | v;
    return this
  },
  rm: function (v) {
    this.value = this.value & ~v;
    return this
  },
  assign: function (v) {
    this.value = v;
    return this
  }
};

var options = { root: null, rootMargin: '0px', threshold: [0, 0.01] };

var observable = !!window.IntersectionObserver;

var observe = function (el, fn) {
  if (!observable) { return fn() }
  var observer = new IntersectionObserver (fn, options);
  observer.observe(el);
  return function () { observer.unobserve(el); }
};

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
  animationEndHandlers: []
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
  var onanimationEnd = onFn('animationEnd');

  if (!root) { return }

  if (css) {
    width = Number(computedProp(root, 'width').slice(0, -2));
    height = Number(computedProp(root, 'height').slice(0, -2));
  }
  var main = root.children[0], animations = {main: -1, auto: -1}, threshold = width / 3;

  /* phase
   * 0000 0000: idle
   * 0000 0001: start
   * 0000 0010: dragging
   * 0000 0100: animating
   * 0000 1000: vertical scrolling
   * 0001 0000: auto animating
   * 0010 0000: cancel auto animating
   */

  var phaseEnum = {
    idle:           0,
    start:          1,
    dragging:       2,
    animating:      4,
    vscrolling:     8,
    autoanimating:  16,
    cancelauto:     32
  };
  var phase = new bitEnum();

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
  var stopR = function (_) { return !cycle && currentX > startX && current === slides.$head; };
  var stopL = function (_) { return !cycle && currentX <= startX && current === slides.$tail; };

  var clearAuto = function (_) { return clearTimeout(animations.auto); };
  var clearMain = function (_) { return caf(animations.main); };
  var clearAnimations = function (_) {clearAuto(); clearMain();};

  init();

  return {
    destroy: destroy,
    index: function (_) { return current.$index; },
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
    onMove(current.$index, current, main, elms);
  }

  function onTouchStart (evt) {
    clearAnimations();
    phase.or(phaseEnum.start).rm(phaseEnum.vscrolling);
    direction = 0;

    var touch = evt.touches[0];
    startTime = Date.now();
    restartX = currentX = startX = touch.pageX;
    startY = touch.clientY;
    onStart(current.$index, current, main, elms);
  }

  function onTouchMove (evt) {
    if (phase.is(phaseEnum.vscrolling)) { return }

    var touch = evt.touches[0];
    var gap = touch.pageX - currentX;

    if (phase.is(phaseEnum.start) && Math.abs(gap) * 2 < Math.abs(touch.clientY - startY)) {
      phase.or(phaseEnum.vscrolling).rm(phaseEnum.start);
      return
    }

    var _d = gap > 0 ? 1 : -1;
    if (direction !== _d) {
      restartX = currentX;
      startTime = Date.now();
      direction = _d;
    }

    phase.assign(phaseEnum.dragging);
    currentX = touch.pageX;

    x = x + gap;
    // moveX(main, x)
    moveEx(main, x);

    evt.preventDefault();
  }

  function moveRight () {
    two || hide(current.$next);
    current = current.$prev;
    if (!stopR()) {
      moveEx(current.$prev, current.x - width);
      show(current.$prev);
    }
  }

  function moveLeft () {
    two || hide(current.$prev);
    current = current.$next;
    if (!stopL()) {
      moveEx(current.$next, current.x + width);
      show(current.$next);
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
    phase.assign(phaseEnum.autoanimating);
    animate(main, x, -current.x - width, MAX_PART, onAutoAnimation, autoSwipePostpone);
    // animate(main, x, x - width, MAX_INTERVAL, onAutoAnimation, autoCallback)
    onEnd(current.$next.$index, current.$next, main, elms);
  }

  function autoSwipe() {
    if (Math.abs(x + current.x) > 3) { autoSwipeImmediate(); }
    else { autoSwipePostpone(); }
  }

  function onTouchEnd (evt) {
    // auto && autoCallback()
    if (phase.is(phaseEnum.vscrolling) && !phase.is(phaseEnum.animating) && !phase.is(phaseEnum.autoanimating)) { return }
    phase.assign(phaseEnum.animating);
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

    onEnd(current.$index, current, main, elms);
  }

  function animate (elm, from, to, interval, onAnimation, callback) {
    var start = Date.now();
    function loop () {
      var now = Date.now();
      var during = now - start;
      if (during >= interval) { x = to; }
      isFunction(onAnimation) && onAnimation();
      if (during >= interval) {
        // moveX(elm, to)
        moveEx(elm, to);
        !phase.is(phaseEnum.cancelauto) && isFunction(callback) && callback();
        phase.assign(phaseEnum.idle);
        return onanimationEnd(current.$index, current, main, elms)
      }
      var distance = (to - from) * easing[ease](during / interval) + from;
      x = distance;
      // moveX(elm, distance)
      moveEx(elm, x);
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
      elms[0].$index = elms[2].$index = 0;
      elms[1].$index = elms[3].$index = 1;
    }
    var one = elms.length === 1;
    two = elms.length === 2;
    // slides = new Link(elms, needClone ? '0101' : null)
    slides = new Link(elms);
    needClone || elms.forEach(function (e, i) { return e.$index = i; });

    moveEx(current, 0);
    one || two || moveEx(current.$prev, -width);
    one || moveEx(current.$next, width);
    elms.forEach(function (el) {
      el.style.position = 'absolute';
      if (!css) {
        el.style.width = width + 'px';
        el.style.height = height + 'px';
      }
      // el.style.overflow = 'hidden'
      if (!two && !one && el !== current && el !== current.$prev && el !== current.$next) { hide(el); }
    });

    if (one) { return onInit(current.$index, current, main, elms) }

    if (!two && !cycle && index === 0) { hide(current.$prev); }
    if (!two && !cycle && index === elms.length - 1) { hide(current.$next); }

    destroy();
    on(root, pointerdown, onTouchStart);
    on(root, pointermove, onTouchMove);
    on(root, pointerup, onTouchEnd);

    // stop auto swipe when out of screen
    if (auto) {
      if (observable) {
        raf(function () {
          opts.unobserve = observe(root, function (entries) {
            if (entries && entries[0].intersectionRatio === 0) { clearAuto(phase.assign(phaseEnum.cancelauto)); }
            else { autoSwipe(); }
          });
        });
      } else {
        var toggleSwiper = function () { return inViewport(root) ? autoSwipePostpone() : clearAuto(phase.assign(phaseEnum.cancelauto)); };
        on(window, 'touchmove', function () { return clearAuto(phase.assign(phaseEnum.cancelauto)); });
        on(window, 'touchend', toggleSwiper);
        toggleSwiper();
      }
    }

    main.x = 0;
    onInit(current.$index, current, main, elms);
  }

  function destroy () {
    clearAnimations();
    isFunction(opts.unobserve) && opts.unobserve();
    off(root, pointerdown, onTouchStart);
    off(root, pointermove, onTouchMove);
    off(root, pointerup, onTouchEnd);
  }
}

export default swipeIt;
