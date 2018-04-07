import {on, off, once} from './utils'

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

  if (!root || !elms | elms.length < 2) return

  // var state = {
  //   phase: 0, // dragging, animating
  //   startTime: 0,
  //   startX: 0,
  //   currentX: 0
  // }

  /*
   * 0000: stop
   * 0001: dragging
   * 0010: animating
   * 0100: vertical scrolling
   */
  var phase = 0
  var startTime = 0, startX = 0, currentX = 0, startY = 0, currentY = 0

  var len = elms.length
  var first = elms[0], last = elms[len - 1]

  var current = () => elms[index]
  var prev = () => elms[prevIndex(index, len, cycle)]
  var pprev = () => elms[prevIndex(prevIndex(index, len, cycle), len, cycle)]
  var next = () => elms[nextIndex(index, len, cycle)]
  var nnext = () => elms[nextIndex(nextIndex(index, len, cycle), len, cycle)]
  // var prev = () => index === 0 && !cycle ? null : elms[index === 0 ? len - 1 : index - 1]
  // var next = () => index === len - 1 && !cycle ? null : elms[index === len - 1 ? 0 : index + 1]
  // var first = () => elms[0]
  // var last = () => elms[elms.length - 1]
  var gap = () => Math.min(Math.max(-width, currentX - startX), width)

  init()

  return {
    init,
    print () {
      console.log()
    }
  }

  function onTouchStart (evt) {
    if (phase === 4 || phase === 2) return
    phase = 0

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

    evt.preventDefault()

    // console.log('gap: ', _gap)
    // console.log('width: ', width)
    moveX(prev(), _gap - width)
    moveX(current(), _gap)
    moveX(next(), _gap + width)
    moveX(right ? pprev() : nnext(), right ? _gap - 2 * width : _gap + 2 * width)
  }

  function onTouchEnd (evt) {
    if (phase === 4 || phase === 2) return
    phase = 2

    var _gap = gap()
    var right = _gap >= 0
    if (!shouldCancel()) {
      moveX(_gap >= 0 ? next() : prev(), -width)

      index = _gap >= 0 ? index - 1 : index + 1
      if (index < 0) index = len - 1
      else if (index === len) index = 0

      // moveX(_gap >= 0 ? prev() : next(), _gap >= 0 ? -width : width)
      phase = 0
    }
    // setTimeout(() => {
      animateX(prev(), -width)
      animateX(current(), 0)
      animateX(next(), width)
    // }, 20)
  }

  function animateX (el, offset) {
    el.style.webkitTransition = `-webkit-transform ${interval}ms cubic-bezier(0.22, 0.61, 0.36, 1)`
    // use setTimeout 20 instead of requestAnimationFrame
    setTimeout(() => el.style.webkitTransform = `translate3d(${offset}px, 0, 0)`, 20)
    var called = false
    function callback () {
      if (called) return
      called = true
      this.status = 0
      el.style.webkitTransition = ''
    }
    once(el, 'webkitTransitionEnd', callback)
    setTimeout(callback, interval + 20)
  }

  function shouldCancel () {
    return false
  }

  function init () {
    elms.forEach((el, i) => moveX(el, i === index ? 0 : -width))

    // index = opts.index
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

function prevIndex(index, len, cycle) {
  return index === 0 && !cycle ? -1 : (index === 0 ? len - 1 : index - 1)
}
function nextIndex(index, len, cycle) {
  return index === len - 1 && !cycle ? -1 : (index === len - 1 ? 0 : index + 1)
}

export default swipeIt
