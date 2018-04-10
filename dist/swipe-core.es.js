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

var FAST_THRESHOLD = 120;
var FAST_INTERVAL = 200;
var MAX_INTERVAL = 1000;

var defaultOptions = {
  cycle: true,
  expose: false,
  root: null, // required
  elms: [], // required
  index: 0,
  width: window.screen.width, // required
  height: 200 // required
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

  if (!root) { return }

  var main = root.children[0], animations = {main: -1}, threshold = width / 2;

  /*
   * 0000: start
   * 0001: dragging
   * 0010: animating
   * 0100: vertical scrolling
   */
  var phase = 0;
  var restartX = 0, direction = 0; // -1: left, 0: na, 1: right
  var x = 0, startTime = 0, startX = 0, currentX = 0, startY = 0, slides = [];

  var current = elms[index];

  var show = function (el) { return main.appendChild(el); };
  var stopR = function () { return !cycle && currentX > startX && current === slides.head; };
  var stopL = function () { return !cycle && currentX <= startX && current === slides.tail; };
  init();

  return {
    init: init, destroy: destroy
  }

  function onTouchStart (evt) {
    if (phase === 2) {
      // while (animations.length) animations.splice(0, 1)[0]()
      cancelFrame(animations.main);
    }
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
    hide(current.next);
    current = current.prev;
    if (!stopR()) {
      moveEx(current.prev, current.x - width);
      show(current.prev);
    }
  }

  function moveLeft () {
    hide(current.prev);
    current = current.next;
    if (!stopL()) {
      moveEx(current.next, current.x + width);
      show(current.next);
    }
  }

  function onTouchEnd (evt) {
    if (phase === 4 || currentX === startX) { return }
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
    var t = Math.min(Math.max(MAX_INTERVAL * Math.abs(to - x) / width, FAST_INTERVAL), MAX_INTERVAL * 2 / 3);

    animate(main, x, to, fast ? FAST_INTERVAL : t);
  }

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
      x = distance;
      moveX(elm, distance);
      animations.main = requestFrame(loop);
    }
    loop();
  }

  function init () {
    if (!expose) { root.style.overflow = 'hidden'; }
    root.style.position = 'relative';
    root.style.width = width + 'px';
    root.style.height = height + 'px';
    slides = new LinkList(elms);
    moveEx(current, 0);
    moveEx(current.prev, -width);
    moveEx(current.next, width);
    elms.forEach(function (el) {
      el.style.position = 'absolute';
      el.style.width = width + 'px';
      el.style.height = height + 'px';
      el.style.overflow = 'hidden';
      if (el !== current && el !== current.prev && el !== current.next) { hide(el); }
    });

    if (!cycle && index === 0) { hide(current.prev); }
    if (!cycle && index === elms.length - 1) { hide(current.next); }

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
var moveEx = function (el, x) { el.x = x; moveX(el, x); };
var hide = function (el) { return hides.appendChild(el); };

function moveX (el, x) {
  if (!el) { return }
  el.style.webkitTransition = '';
  el.style.webkitTransform = "translate3d(" + x + "px, 0, 0)";
}

export default swipeIt;
