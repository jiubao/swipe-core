import {on, off, once, LinkList, requestFrame, cancelFrame, cubic, isFunction} from './utils'

const FAST_THRESHOLD = 120
const FAST_INTERVAL = 200
const MAX_INTERVAL = 1000

var defaultOptions = {
  cycle: true,
  expose: false,
  root: null, // required
  elms: [], // required
  index: 0,
  width: window.screen.width, // required
  height: 200 // required
}

var hides = document.createElement('div')
hides.style.display = 'none'
document.body.appendChild(hides)

function swipeIt (options) {
  var opts = {
    ...defaultOptions,
    ...options
  }

  var {index, root, elms, width, height, cycle, expose} = opts

  if (!root) return

  var main = root.children[0], animations = {main: -1}, threshold = width / 2

  /*
   * 0000: start
   * 0001: dragging
   * 0010: animating
   * 0100: vertical scrolling
   */
  var phase = 0
  var restartX = 0, direction = 0 // -1: left, 0: na, 1: right
  var x = 0, startTime = 0, startX = 0, currentX = 0, startY = 0, slides = []

  var current = elms[index]

  const show = el => main.appendChild(el)
  const stopR = () => !cycle && currentX > startX && current === slides.head
  const stopL = () => !cycle && currentX <= startX && current === slides.tail
  init()

  return {
    init, destroy
  }

  function onTouchStart (evt) {
    if (phase === 2) {
      // while (animations.length) animations.splice(0, 1)[0]()
      cancelFrame(animations.main)
    }
    phase = 0
    direction = 0

    var touch = evt.touches[0]
    startTime = Date.now()
    restartX = currentX = startX = touch.pageX
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

    var _d = gap > 0 ? 1 : -1
    if (direction !== _d) {
      restartX = currentX
      startTime = Date.now()
      direction = _d
    }

    phase = 1
    currentX = touch.pageX

    x = x + gap
    moveX(main, x)

    evt.preventDefault();
  }

  function moveRight () {
    hide(current.next)
    current = current.prev
    if (!stopR()) {
      moveEx(current.prev, current.x - width)
      show(current.prev)
    }
  }

  function moveLeft () {
    hide(current.prev)
    current = current.next
    if (!stopL()) {
      moveEx(current.next, current.x + width)
      show(current.next)
    }
  }

  function onTouchEnd (evt) {
    if (phase === 4 || currentX === startX) return
    phase = 2
    var right = currentX > restartX
    var fast = (Date.now() - startTime) < FAST_THRESHOLD

    if (!stopR() && !stopL()) {
      var cx = current.x + x
      if (fast) {
        if (right && cx > 0) moveRight()
        else if (!right && cx < 0) moveLeft()
      } else if (cx > threshold) moveRight()
      else if (cx < -threshold) moveLeft()
    }

    var to = current.x * -1
    var t = Math.min(Math.max(MAX_INTERVAL * Math.abs(to - x) / width, FAST_INTERVAL), MAX_INTERVAL * 2 / 3)

    animate(main, x, to, fast ? FAST_INTERVAL : t)
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

  function init () {
    if (!expose) root.style.overflow = 'hidden'
    root.style.position = 'relative'
    root.style.width = width + 'px'
    root.style.height = height + 'px'
    slides = new LinkList(elms)
    moveEx(current, 0)
    moveEx(current.prev, -width)
    moveEx(current.next, width)
    elms.forEach(el => {
      el.style.position = 'absolute'
      el.style.width = width + 'px'
      el.style.height = height + 'px'
      el.style.overflow = 'hidden'
      if (el !== current && el !== current.prev && el !== current.next) hide(el)
    })

    if (!cycle && index === 0) hide(current.prev)
    if (!cycle && index === elms.length - 1) hide(current.next)

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
const hide = el => hides.appendChild(el)

function moveX (el, x) {
  if (!el) return
  el.style.webkitTransition = ''
  el.style.webkitTransform = `translate3d(${x}px, 0, 0)`
}

export default swipeIt
