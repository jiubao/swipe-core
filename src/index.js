import {on, off, LinkList, raf, caf, easing, isFunction, pointerdown, pointermove, pointerup, computedProp} from './utils'
import observe from './intersect'

const FAST_THRESHOLD = 120
const FAST_INTERVAL = 250
const MAX_INTERVAL = 1000
const MAX_PART = MAX_INTERVAL * 2 / 3
const AUTO_TIMEOUT = 3000

const empty = _ => {}
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
  // onInit: empty,
  // onStart: empty,
  // onMove: empty,
  // onEnd: empty,
  // onEndAnimation: empty,
  plugins: []
}

var hides = document.createElement('div')
hides.style.display = 'none'
document.body.appendChild(hides)

function swipeIt (options) {
  var opts = {
    ...defaultOptions,
    ...options
  }

  // var {index, root, elms, width, height, cycle, expose, auto, css, ease, onInit, onStart, onMove, onEnd, onEndAnimation, plugins} = opts
  var {index, root, elms, width, height, cycle, expose, auto, css, ease, plugins} = opts
  var onInit = (...args) => plugins.forEach(p => isFunction(p.init) && p.init.apply(null, args))
  var onStart = (...args) => plugins.forEach(p => isFunction(p.start) && p.start.apply(null, args))
  var onMove = (...args) => plugins.forEach(p => isFunction(p.move) && p.move.apply(null, args))
  var onEnd = (...args) => plugins.forEach(p => isFunction(p.end) && p.end.apply(null, args))
  var onEndAnimation = (...args) => plugins.forEach(p => isFunction(p.endAnimation) && p.endAnimation.apply(null, args))

  if (!root) return

  if (css) {
    width = Number(computedProp(root, 'width').slice(0, -2))
    height = Number(computedProp(root, 'height').slice(0, -2))
  }
  var main = root.children[0], animations = {main: -1, auto: -1}, threshold = width / 3

  /* phase
   * 0000: start
   * 0001: dragging
   * 0010: animating
   * 0100: vertical scrolling
   * 1000: auto animating
   * 10000: cancel auto animating
   */
  var phase = 0

  /* autoPhase
   * 0: distance <= width / 2
   * 1: distance > width / 2
   */
  var autoPhase = 0
  var restartX = 0, direction = 0 // -1: left, 0: na, 1: right
  var x = 0, startTime = 0, startX = 0, currentX = 0, startY = 0, slides = []
  var two = false
  auto = cycle && auto

  var current = elms[index]

  const moveE = el => moveX(el, el.x)
  const moveEx = (el, x) => { el.x = x; moveX(el, x); }
  const hide = el => hides.appendChild(el)

  const show = el => main.appendChild(el)
  const stopR = _ => !cycle && currentX > startX && current === slides.head
  const stopL = _ => !cycle && currentX <= startX && current === slides.tail

  var clearAuto = _ => clearTimeout(animations.auto)
  var clearMain = _ => caf(animations.main)
  var clearAnimations = _ => {clearAuto(); clearMain();}

  init()

  return {
    destroy, index: _ => current.index
  }

  function moveX (el, x) {
    if (!el) return
    el.style.transition = el.style.webkitTransition = ''
    el.style.transform = el.style.webkitTransform = `translate3d(${x}px, 0, 0)`
    onMove(current.index, current, main, elms)
  }

  function onTouchStart (evt) {
    clearAnimations()
    phase = 0
    direction = 0

    var touch = evt.touches[0]
    startTime = Date.now()
    restartX = currentX = startX = touch.pageX
    startY = touch.clientY
    onStart(current.index, current, main, elms)
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
    // moveX(main, x)
    moveEx(main, x)

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
    if (autoPhase === 0 && -current.x - x > width / 2) {
      autoPhase = 1
      moveLeft()
    }
  }

  function autoCallback () {
    clearAuto()
    animations.auto = setTimeout(() => {
      autoPhase = 0
      phase = 8
      animate(main, x, x - width, MAX_PART, onAutoAnimation, autoCallback)
      // animate(main, x, x - width, MAX_INTERVAL, onAutoAnimation, autoCallback)
      onEnd(current.next.index, current.next, main, elms)
    }, AUTO_TIMEOUT)
  }

  function onTouchEnd (evt) {
    auto && autoCallback()
    if (phase === 4) return
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

    var t = Math.min(Math.max(MAX_INTERVAL * Math.abs(to - x) / width, FAST_INTERVAL), MAX_PART)
    animate(main, x, to, fast ? FAST_INTERVAL : t)

    onEnd(current.index, current, main, elms)
  }

  function animate (elm, from, to, interval, onAnimation, callback) {
    var start = Date.now()
    function loop () {
      // console.log(elm.parentElement.id)
      isFunction(onAnimation) && onAnimation()
      var now = Date.now()
      var during = now - start
      if (during >= interval) {
        // moveX(elm, to)
        moveEx(elm, to)
        phase !== 16 && isFunction(callback) && callback()
        return onEndAnimation(current.index, current, main, elms)
      }
      var distance = (to - from) * easing[ease](during / interval) + from
      x = distance
      // moveX(elm, distance)
      moveEx(elm, distance)
      animations.main = raf(loop)
    }
    loop()
  }

  function init () {
    if (elms.length === 0) return onInit(-1)
    // if (!expose) root.style.overflow = 'hidden'
    root.style.position = 'relative'
    if (!css) {
      root.style.width = width + 'px'
      root.style.height = height + 'px'
    }
    var needClone = elms.length === 2 && cycle
    if (needClone) {
      elms.push(elms[0].cloneNode(true))
      show(elms[2])
      elms.push(elms[1].cloneNode(true))
      show(elms[3])
    }
    var one = elms.length === 1
    two = elms.length === 2
    slides = new LinkList(elms, needClone ? '0101' : null)
    moveEx(current, 0)
    one || two || moveEx(current.prev, -width)
    one || moveEx(current.next, width)
    elms.forEach(el => {
      el.style.position = 'absolute'
      if (!css) {
        el.style.width = width + 'px'
        el.style.height = height + 'px'
      }
      // el.style.overflow = 'hidden'
      if (!two && !one && el !== current && el !== current.prev && el !== current.next) hide(el)
    })

    if (one) return onInit(current.index, current, main, elms)

    if (!two && !cycle && index === 0) hide(current.prev)
    if (!two && !cycle && index === elms.length - 1) hide(current.next)

    destroy()
    on(root, pointerdown, onTouchStart)
    on(root, pointermove, onTouchMove)
    on(root, pointerup, onTouchEnd)

    auto && raf(() => {
      opts.unobserve = observe(root, function (entries) {
        if (entries && entries[0].intersectionRatio === 0) clearAuto(phase = 16);
        else autoCallback();
      })
    })

    main.x = 0
    onInit(current.index, current, main, elms)
  }

  function destroy () {
    clearAnimations()
    isFunction(opts.unobserve) && opts.unobserve()
    off(root, pointerdown, onTouchStart)
    off(root, pointermove, onTouchMove)
    off(root, pointerup, onTouchEnd)
  }
}

export default swipeIt
