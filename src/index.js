import {on, off, once, LinkList, requestFrame, cancelFrame, cubic, isFunction} from './utils'

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

var hide = document.createElement('div')
hide.style.display = 'none'
document.body.appendChild(hide)

function swipeIt (options) {
  var opts = {
    ...defaultOptions,
    ...options
  }

  var {index, root, elms, width, height, cycle, expose, interval} = opts

  if (!root) return

  var main = root.children[0], animations = {main: -1}, threshold = width / 3

  /*
   * 0000: start
   * 0001: dragging
   * 0010: animating
   * 0100: vertical scrolling
   */
  var phase = 0
  var x = 0, startTime = 0, startX = 0, currentX = 0, startY = 0, slides = [] //, left = 0

  var current = elms[index]

  init()

  return {
    init
  }

  function onTouchStart (evt) {
    if (phase === 2) {
      // while (animations.length) animations.splice(0, 1)[0]()
      cancelFrame(animations.main)
    }
    phase = 0

    var touch = evt.touches[0]
    startTime = Date.now()
    currentX = startX = touch.pageX
    startY = touch.clientY
  }

  function onTouchMove (evt) {
    if (phase === 2 || phase === 4) return

    var touch = evt.touches[0]
    var gap = touch.pageX - currentX

    if (phase === 0 && Math.abs(gap) * 2 < Math.abs(touch.clientY - startY)) {
      phase = 4
      return
    }

    phase = 1
    currentX = touch.pageX

    x = x + gap
    moveX(main, x)

    evt.preventDefault();
  }

  function onTouchEnd (evt) {
    if (phase === 4) return
    phase = 2
    var right = (currentX - startX) >= 0
    var fast = (Date.now() - startTime) < 200

    // if (!cycle && (right && current === slides.head) || (!right && current === slides.tail)) {} else {
    var cx = current.x + x
    if (cx > threshold || (fast && right)) {
      hide.appendChild(current.next)
      current = current.prev
      moveEx(current.prev, current.x - width)
      main.appendChild(current.prev)
    } else if (cx < -threshold || (fast && !right)) {
      hide.appendChild(current.prev)
      current = current.next
      moveEx(current.next, current.x + width)
      main.appendChild(current.next)
    }

    animate(main, x, current.x * -1, fast ? 150 : interval)
  }

  function animate (elm, from, to, interval, callback) {
    var start = Date.now()
    function loop () {
      var now = Date.now()
      var during = now - start
      if (during >= interval) {
        moveX(elm, to)
        isFunction(callback) && callback()
        return
      }
      var distance = (to - from) * cubic(during / interval) + from
      x = distance
      moveX(elm, distance)
      animations.main = requestFrame(loop)
    }
    loop()
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
    slides = new LinkList(elms)
    moveEx(current, 0)
    moveEx(current.prev, -width)
    moveEx(current.next, width)
    elms.forEach((el, i) => {
      if (el !== current && el !== current.prev && el !== current.next) hide.appendChild(el)
    })

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

const moveE = el => moveX(el, el.x)
const moveEx = (el, x) => { el.x = x; moveX(el, x); }

function moveX (el, x) {
  if (!el) return
  el.style.webkitTransition = ''
  el.style.webkitTransform = `translate3d(${x}px, 0, 0)`
}

export default swipeIt
