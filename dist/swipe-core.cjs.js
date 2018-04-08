'use strict';

function on (element, evt, handler) {
  element.addEventListener(evt, handler, false);
}

function off (element, evt, handler) {
  element.removeEventListener(evt, handler, false);
}

/* istanbul ignore next */
var once = function (el, event, fn) {
  var listener = function () {
    if (fn) {
      fn.apply(this, arguments);
    }
    off(el, event, listener);
  };
  on(el, event, listener);
};

function newNode (item) {
  // var node = Object.create(null)
  // node.item = item
  // return node.next = node.prev = node
  return item.next = item.prev = item
}

function LinkList (arr) {
  var this$1 = this;

  this.list = [];
  arr.forEach(function (item) { return this$1.append(item); });
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

  /*
   * 0000: stop
   * 0001: dragging
   * 0010: animating
   * 0100: vertical scrolling
   */
  var phase = 0;
  var startTime = 0, startX = 0, currentX = 0, startY = 0, currentY = 0, len = elms.length, slides = [];

  var current = elms[index];
  var prev = function () { return current.prev; };
  var next = function () { return current.next; };
  var gap = function () { return Math.min(Math.max(-width, currentX - startX), width); };

  init();

  return {
    init: init
  }

  function onTouchStart (evt) {
    if (phase === 4 || phase === 2) { return }
    phase = 0;

    var touch = evt.touches[0];
    startTime = Date.now();
    currentX = startX = touch.pageX;
    currentY = startY = touch.clientY;
  }

  function onTouchMove (evt) {
    if (phase === 2 || phase === 4) { return }

    var touch = evt.touches[0];
    currentX = touch.pageX;
    currentY = touch.clientY;
    var _gap = gap();
    var right = _gap >= 0;

    if (phase === 0) {
      var x = Math.abs(_gap);
      var y = Math.abs(currentY - startY);
      if (x * 2 < y) {
        phase = 4;
        return
      }

      phase = 1;
    }

    evt.preventDefault();

    (expose || right) && moveX(prev(), _gap - width);
    moveX(current, _gap);
    (expose || !right) && moveX(next(), _gap + width);
    expose && moveX(right ? prev().prev : next().next, right ? _gap - 2 * width : _gap + 2 * width);
  }

  function onTouchEnd (evt) {
    if (phase === 4 || phase === 2) { return }
    phase = 2;

    var _gap = gap();
    var right = _gap >= 0;

    var abort = shouldCancel();
    abort || moveX(right ? next() : prev(), 10000);

    (abort || right) && animateX(prev(), abort ? -width : 0);
    animateX(current, abort ? 0 : width * (right ? 1 : -1));
    (abort || !right) && animateX(next(), abort ? width : 0);
    (expose && !abort) && animateX(right ? prev().prev : next().next, right ? -width : width);

    if (!abort) { current = current[right ? 'prev' : 'next']; }
    phase = 0;

    // var canceled = shouldCancel()
    // if (!canceled) {
    //   moveX(right ? next() : prev(), 10000)
    //   current = current[right ? 'prev' : 'next']
    // }
    // phase = 0;
    // (expose || !right) && animateX(prev(), -width);
    // animateX(current, 0);
    // (expose || right) && animateX(next(), width);
  }

  function animateX (el, offset) {
    // el.style.webkitTransition = '-webkit-transform 100ms ease-in-out';
    el.style.webkitTransition = "-webkit-transform " + interval + "ms cubic-bezier(0.22, 0.61, 0.36, 1)";
    // use setTimeout 20 instead of requestAnimationFrame
    setTimeout(function () { return el.style.webkitTransform = "translate3d(" + offset + "px, 0, 0)"; }, 20);
    var called = false;
    function callback () {
      if (called) { return }
      called = true;
      this.status = 0;
      el.style.webkitTransition = '';
    }
    once(el, 'webkitTransitionEnd', callback);
    setTimeout(callback, interval + 20);
  }

  function shouldCancel () {
    var _gap = gap();
    var right = _gap >= 0;
    var cancel = Math.abs(_gap) < width / 3;
    var endTime = Date.now();
    var duration = endTime - startTime;

    var result = ((duration > 300 || duration < 16) && cancel) || (!cycle && right && current === slides.head) || (!cycle && !right && current === slides.tail);
    console.log('should cancel: ', result);
    return result
  }

  function init () {
    len = elms.length;
    slides = new LinkList(elms);
    elms.forEach(function (el, i) { return moveX(el, i === index ? 0 : 10000); });

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

// var prev = () => elms[prevIndex(index, len, cycle)]
// var pprev = () => elms[prevIndex(prevIndex(index, len, cycle), len, cycle)]
// var next = () => elms[nextIndex(index, len, cycle)]
// var nnext = () => elms[nextIndex(nextIndex(index, len, cycle), len, cycle)]
// var prev = () => index === 0 && !cycle ? null : elms[index === 0 ? len - 1 : index - 1]
// var next = () => index === len - 1 && !cycle ? null : elms[index === len - 1 ? 0 : index + 1]
// var first = () => elms[0]
// var last = () => elms[elms.length - 1]
// function prevIndex(index, len, cycle) {
//   return index === 0 && !cycle ? -1 : (index === 0 ? len - 1 : index - 1)
// }
// function nextIndex(index, len, cycle) {
//   return index === len - 1 && !cycle ? -1 : (index === len - 1 ? 0 : index + 1)
// }

module.exports = swipeIt;
