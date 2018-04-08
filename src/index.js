import {on, off, once, LinkList} from './utils'

var defaultOptions = {
  interval: 500,
  cycle: true,
  expose: false,
  root: null, // required
  elms: [], // required
  index: 0,
  width: 375, // required
  height: 100 // required
}

function swipeIt (options) {
  var opts = {
    ...defaultOptions,
    ...options
  }

  var {index, root, elms, width, height, cycle, expose, interval} = opts

  if (!root) return

  /*
   * 0000: stop
   * 0001: dragging
   * 0010: animating
   * 0100: vertical scrolling
   */
  var phase = 0
  var startTime = 0, startX = 0, currentX = 0, startY = 0, currentY = 0, len = elms.length, slides = []

  var current = elms[index]
  var prev = () => current.prev
  var next = () => current.next
  var gap = () => Math.min(Math.max(-width, currentX - startX), width)
  var animations = []

  init()

  return {
    init
  }

  function onTouchStart (evt) {
    if (phase === 4 || phase === 2) return
    phase = 0
    while (animations.length) animations.splice(0, 1)[0]()

    var touch = evt.touches[0]
    startTime = Date.now()
    currentX = startX = touch.pageX
    currentY = startY = touch.clientY
  }

  function onTouchMove (evt) {
    if (phase === 2 || phase === 4) return

    var touch = evt.touches[0]
    currentX = touch.pageX
    currentY = touch.clientY
    var _gap = gap()
    var right = _gap >= 0

    if (phase === 0) {
      var x = Math.abs(_gap)
      var y = Math.abs(currentY - startY)
      if (x * 2 < y) {
        phase = 4
        return
      }

      phase = 1
    }

    evt.preventDefault();

    (expose || right) && moveX(prev(), _gap - width);
    moveX(current, _gap);
    (expose || !right) && moveX(next(), _gap + width);
    expose && moveX(right ? prev().prev : next().next, right ? _gap - 2 * width : _gap + 2 * width);
  }

  function onTouchEnd (evt) {
    if (phase === 4 || phase === 2) return
    phase = 2

    var _gap = gap()
    var right = _gap >= 0

    var abort = shouldCancel();
    abort || moveX(right ? next() : prev(), 10000);

    (abort || right) && animateX(prev(), abort ? -width : 0);
    animateX(current, abort ? 0 : width * (right ? 1 : -1));
    (abort || !right) && animateX(next(), abort ? width : 0);
    (expose && !abort) && animateX(right ? prev().prev : next().next, right ? -width : width);

    if (!abort) current = current[right ? 'prev' : 'next'];
    phase = 0;
  }

  function animateX (el, offset) {
    // el.style.webkitTransition = '-webkit-transform 100ms ease-in-out';
    el.style.webkitTransition = `-webkit-transform ${interval}ms cubic-bezier(0.22, 0.61, 0.36, 1)`
    // use setTimeout 20 instead of requestAnimationFrame
    setTimeout(() => el.style.webkitTransform = `translate3d(${offset}px, 0, 0)`, 0)
    var called = false
    function callback () {
      if (called) return
      called = true
      el.style.webkitTransition = ''
    }
    once(el, 'webkitTransitionEnd', callback)
    var t1 = setTimeout(callback, interval + 20)
    animations.push(function () {
      clearTimeout(t1)
      callback()
    })
  }

  function shouldCancel () {
    var _gap = gap()
    var right = _gap >= 0
    var cancel = Math.abs(_gap) < width / 3
    var endTime = Date.now()
    var duration = endTime - startTime

    return ((duration > 300 || duration < 16) && cancel) || (!cycle && right && current === slides.head) || (!cycle && !right && current === slides.tail)
  }

  function init () {
    len = elms.length
    slides = new LinkList(elms)
    elms.forEach((el, i) => moveX(el, i === index ? 0 : 10000))

    destroy()
    on(root, 'touchstart', onTouchStart)
    on(root, 'touchmove', onTouchMove)
    on(root, 'touchend', onTouchEnd)
  }

  function destroy () {
    off(root, 'touchstart', onTouchStart)
    off(root, 'touchmove', onTouchMove)
    off(root, 'touchend', onTouchEnd)
  }
}

function moveX (el, x) {
  if (!el) return
  el.style.webkitTransition = ''
  el.style.webkitTransform = `translate3d(${x}px, 0, 0)`
}

export default swipeIt

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
