import {on, off, once, LinkList, raf, caf, cubic, isFunction, pointerdown, pointermove, pointerup, computedProp} from './utils'

const FAST_THRESHOLD = 120
const FAST_INTERVAL = 250
const MAX_INTERVAL = 1000
const AUTO_TIMEOUT = 3000

var defaultOptions = {
  auto: false,
  cycle: true,
  expose: false,
  root: null, // required
  elms: [], // required
  index: 0,
  width: window.screen.width, // required
  height: 200, // required
  css: false
}

var hides = document.createElement('div')
hides.style.display = 'none'
document.body.appendChild(hides)

function swipeIt (options) {
  var opts = {
    ...defaultOptions,
    ...options
  }

  var {index, root, elms, width, height, cycle, expose, auto, css} = opts

  if (!root) return

  if (css) {
    width = Number(computedProp(root, 'width').slice(0, -2))
    height = Number(computedProp(root, 'height').slice(0, -2))
  }
  var main = root.children[0], animations = {main: -1, timeouts: []}, threshold = width / 3

  /*
   * 0000: start
   * 0001: dragging
   * 0010: animating
   * 0100: vertical scrolling
   */
  var phase = 0, autoPhase = 0
  var restartX = 0, direction = 0 // -1: left, 0: na, 1: right
  var x = 0, startTime = 0, startX = 0, currentX = 0, startY = 0, slides = []
  var two = false

  var current = elms[index]

  const show = el => main.appendChild(el)
  const stopR = () => !cycle && currentX > startX && current === slides.head
  const stopL = () => !cycle && currentX <= startX && current === slides.tail
  init()

  return {
    destroy, index: _ => current.index
  }

  function onTouchStart (evt) {
    caf(animations.main)
    while (animations.timeouts.length) clearTimeout(animations.timeouts.splice(0, 1)[0])
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
    two || hide(current.next)
    current = current.prev
    if (!stopR()) {
      moveEx(current.prev, current.x - width)
      show(current.prev)
    }
  }

  function moveLeft () {
    two || hide(current.prev)
    current = current.next
    if (!stopL()) {
      moveEx(current.next, current.x + width)
      show(current.next)
    }
  }

  function onAutoAnimation () {
    if (-current.x - x <= width / 2) autoPhase = 0
    else if (autoPhase === 0) {
      autoPhase = 1
      moveLeft()
    }
  }

  function autoCallback () {
    animations.timeouts.push(setTimeout(() => animate(main, x, x - width, MAX_INTERVAL, onAutoAnimation, autoCallback), AUTO_TIMEOUT))
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
    auto && autoCallback()
  }

  function animate (elm, from, to, interval, onAnimation, callback) {
    var start = Date.now()
    function loop () {
      isFunction(onAnimation) && onAnimation()
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
      animations.main = raf(loop)
    }
    loop()
  }

  function init () {
    if (elms.length === 0) return
    if (!expose) root.style.overflow = 'hidden'
    root.style.position = 'relative'
    if (!css) {
      root.style.width = width + 'px'
      root.style.height = height + 'px'
    }
    if (elms.length === 2 && cycle) {
      elms.push(elms[0].cloneNode(true))
      show(elms[2])
      elms.push(elms[1].cloneNode(true))
      show(elms[3])
    }
    var one = elms.length === 1
    two = elms.length === 2
    slides = new LinkList(elms)
    moveEx(current, 0)
    one || two || moveEx(current.prev, -width)
    one || moveEx(current.next, width)
    elms.forEach(el => {
      el.style.position = 'absolute'
      if (!css) {
        el.style.width = width + 'px'
        el.style.height = height + 'px'
      }
      el.style.overflow = 'hidden'
      if (!two && !one && el !== current && el !== current.prev && el !== current.next) hide(el)
    })

    if (one) return

    if (!two && !cycle && index === 0) hide(current.prev)
    if (!two && !cycle && index === elms.length - 1) hide(current.next)

    destroy()
    on(root, pointerdown, onTouchStart)
    on(root, pointermove, onTouchMove)
    on(root, pointerup, onTouchEnd)

    auto && autoCallback()
  }

  function destroy () {
    off(root, pointerdown, onTouchStart)
    off(root, pointermove, onTouchMove)
    off(root, pointerup, onTouchEnd)
  }
}

const moveE = el => moveX(el, el.x)
const moveEx = (el, x) => { el.x = x; moveX(el, x); }
const hide = el => hides.appendChild(el)

function moveX (el, x) {
  if (!el) return
  el.style.transition = el.style.webkitTransition = ''
  el.style.transform = el.style.webkitTransform = `translate3d(${x}px, 0, 0)`
}

export default swipeIt
