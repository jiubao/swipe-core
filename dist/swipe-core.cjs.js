'use strict';

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
var vendorPrefixes = ['webkit','moz','ms','o'];
var raf = vendorPrefixes.reduce(function (result, next) { return result || window[(next + "RequestAnimationFrame")]; }, window.requestAnimationFrame);
var caf = vendorPrefixes.reduce(function (result, next) { return result || window[(next + "CancelAnimationFrame")]; }, window.cancelAnimationFrame);
if (!raf || !caf) {
  var last = 0;
  raf = function (fn) {
    var now = +new Date();
    last = Math.max(now, last + 16);
    return setTimeout(fn, last - now)
  };
  caf = clearTimeout;
}
// window.raf = raf
// window.caf = caf

var cubic = function (k) { return --k * k * k + 1; };

// TODO: desktop support, mouse / pointer events
// var touch = 'ontouchstart' in window
// export var pointerdown = touch ? 'touchstart' : 'mousedown'
// export var pointermove = touch ? 'touchmove' : 'mousemove'
// export var pointerup = touch ? 'touchend' : 'mouseup'
var pointerdown = 'touchstart';
var pointermove = 'touchmove';
var pointerup = 'touchend';

var computedProp = function (el, prop) { return window.getComputedStyle(el, null).getPropertyValue(prop); };

// TODO: check IntersectionObserver
var options = { root: null, rootMargin: '0px', threshold: [0, 1], func: null };
var observer = new IntersectionObserver (callback, options);
function callback (entries, observer) {
  // console.log('intersect:', entries)
  console.log('intersect:', entries[0].intersectionRatio);
  options.func(entries, observer);
}
function observe (el, fn) {
  observer.observe(el);
  options.func = fn;
}

var FAST_THRESHOLD = 120;
var FAST_INTERVAL = 250;
var MAX_INTERVAL = 1000;
var MAX_PART = MAX_INTERVAL * 2 / 3;
var AUTO_TIMEOUT = 1000;

var defaultOptions = {
  auto: false,
  cycle: true,
  expose: false,
  root: null, // required
  elms: [], // required
  index: 0,
  width: window.screen.width, // if css is false, need width & height
  height: 200,
  css: false
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

  if (!root) { return }

  if (css) {
    width = Number(computedProp(root, 'width').slice(0, -2));
    height = Number(computedProp(root, 'height').slice(0, -2));
  }
  var main = root.children[0], animations = {main: -1, timeouts: []}, threshold = width / 3;

  /*
   * 0000: start
   * 0001: dragging
   * 0010: animating
   * 0100: vertical scrolling
   */
  var phase = 0, autoPhase = 0;
  var restartX = 0, direction = 0; // -1: left, 0: na, 1: right
  var x = 0, startTime = 0, startX = 0, currentX = 0, startY = 0, slides = [];
  var two = false;

  var current = elms[index];

  var show = function (el) { return main.appendChild(el); };
  var stopR = function () { return !cycle && currentX > startX && current === slides.head; };
  var stopL = function () { return !cycle && currentX <= startX && current === slides.tail; };
  init();

  return {
    destroy: destroy, index: function (_) { return current.index; }
  }

  function onTouchStart (evt) {
    caf(animations.main);
    while (animations.timeouts.length) { clearTimeout(animations.timeouts.splice(0, 1)[0]); }
    phase = 0;
    direction = 0;

    var touch = evt.touches[0];
    startTime = Date.now();
    restartX = currentX = startX = touch.pageX;
    startY = touch.clientY;
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
    moveX(main, x);

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
    if (-current.x - x <= width / 2) { autoPhase = 0; }
    else if (autoPhase === 0) {
      autoPhase = 1;
      moveLeft();
    }
  }

  function autoCallback () {
    animations.timeouts.push(setTimeout(function () { return animate(main, x, x - width, MAX_PART, onAutoAnimation, autoCallback); }, AUTO_TIMEOUT));
  }

  function onTouchEnd (evt) {
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
    animate(main, x, to, fast ? FAST_INTERVAL : t);
    auto && autoCallback();
  }

  function animate (elm, from, to, interval, onAnimation, callback) {
    var start = Date.now();
    function loop () {
      isFunction(onAnimation) && onAnimation();
      var now = Date.now();
      var during = now - start;
      if (during >= interval) {
        moveX(elm, to);
        isFunction(callback) && callback();
        return
      }
      var distance = (to - from) * cubic(during / interval) + from;
      x = distance;
      moveX(elm, distance);
      animations.main = raf(loop);
    }
    loop();
  }

  function init () {
    if (elms.length === 0) { return }
    if (!expose) { root.style.overflow = 'hidden'; }
    root.style.position = 'relative';
    if (!css) {
      root.style.width = width + 'px';
      root.style.height = height + 'px';
    }
    if (elms.length === 2 && cycle) {
      elms.push(elms[0].cloneNode(true));
      show(elms[2]);
      elms.push(elms[1].cloneNode(true));
      show(elms[3]);
    }
    var one = elms.length === 1;
    two = elms.length === 2;
    slides = new LinkList(elms);
    moveEx(current, 0);
    one || two || moveEx(current.prev, -width);
    one || moveEx(current.next, width);
    elms.forEach(function (el) {
      el.style.position = 'absolute';
      if (!css) {
        el.style.width = width + 'px';
        el.style.height = height + 'px';
      }
      el.style.overflow = 'hidden';
      if (!two && !one && el !== current && el !== current.prev && el !== current.next) { hide(el); }
    });

    if (one) { return }

    if (!two && !cycle && index === 0) { hide(current.prev); }
    if (!two && !cycle && index === elms.length - 1) { hide(current.next); }

    destroy();
    on(root, pointerdown, onTouchStart);
    on(root, pointermove, onTouchMove);
    on(root, pointerup, onTouchEnd);

    auto && autoCallback();
    if (auto) {
      observe(root, function (entries) {
        if (entries[0].intersectionRatio === 1) {
          autoCallback();
        }
        else {
          caf(animations.main);
          while (animations.timeouts.length) { clearTimeout(animations.timeouts.splice(0, 1)[0]); }
        }
      });
    }
  }

  function destroy () {
    // unobserve()
    off(root, pointerdown, onTouchStart);
    off(root, pointermove, onTouchMove);
    off(root, pointerup, onTouchEnd);
  }
}
var moveEx = function (el, x) { el.x = x; moveX(el, x); };
var hide = function (el) { return hides.appendChild(el); };

function moveX (el, x) {
  if (!el) { return }
  el.style.transition = el.style.webkitTransition = '';
  el.style.transform = el.style.webkitTransform = "translate3d(" + x + "px, 0, 0)";
}

module.exports = swipeIt;
