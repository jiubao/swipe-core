import {on, off, easing, isFunction, pointerdown, pointermove, pointerup, computedProp, inViewport, bitEnum} from './utils'
import observe, {observable} from './intersect'
import supportPassive from '@jiubao/passive'
import Link from '@jiubao/link'
import {raf, caf} from '@jiubao/raf'

const FAST_THRESHOLD = 120
const FAST_INTERVAL = 250
const MAX_INTERVAL = 1000
const MAX_PART = MAX_INTERVAL * 2 / 3
const AUTO_TIMEOUT = 3000

var passive = supportPassive()
var events = 'scroll,resize,touchmove'

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
}

var hides = document.createElement('div')
hides.style.display = 'none'
document.body.appendChild(hides)

function swipeIt (options) {
  var opts = {
    ...defaultOptions,
    ...options
  }

  var {index, root, elms, width, height, cycle, expose, auto, css, ease, plugins} = opts

  plugins.forEach(p => Object.keys(p).forEach(action => opts[action + 'Handlers'].push(p[action])))

  var onFn = action => (...args) => opts[action + 'Handlers'].forEach(f => f.apply(null, args))
  var onInit = onFn('init')
  var onStart = onFn('start')
  var onMove = onFn('move')
  var onEnd = onFn('end')
  var onanimationEnd = onFn('animationEnd')

  if (!root) return

  if (css) {
    width = Number(computedProp(root, 'width').slice(0, -2))
    height = Number(computedProp(root, 'height').slice(0, -2))
  }
  var main = root.children[0], animations = {main: -1, auto: -1}, threshold = width / 3

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
    idle:           0b00000000,
    start:          0b00000001,
    dragging:       0b00000010,
    animating:      0b00000100,
    vscrolling:     0b00001000,
    autoanimating:  0b00010000,
    cancelauto:     0b00100000
  }
  var phase = new bitEnum()

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
  const stopR = _ => !cycle && currentX > startX && current === slides.$head
  const stopL = _ => !cycle && currentX <= startX && current === slides.$tail

  var clearAuto = _ => clearTimeout(animations.auto)
  var clearMain = _ => caf(animations.main)
  var clearAnimations = _ => {clearAuto(); clearMain();}

  init()

  return {
    destroy,
    index: _ => current.$index,
    on: (evt, callback) => {
      var fns = opts[evt + 'Handlers']
      fns.push(callback)
      return () => fns.splice(fns.indexOf(callback), 1)
    }
  }

  function moveX (el, x) {
    if (!el) return
    el.style.transition = el.style.webkitTransition = ''
    el.style.transform = el.style.webkitTransform = `translate3d(${x}px, 0, 0)`
    onMove(current.$index, current, main, elms)
  }

  function onTouchStart (evt) {
    clearAnimations()
    phase.or(phaseEnum.start).rm(phaseEnum.vscrolling)
    direction = 0

    var touch = evt.touches[0]
    startTime = Date.now()
    restartX = currentX = startX = touch.pageX
    startY = touch.clientY
    onStart(current.$index, current, main, elms)
  }

  function onTouchMove (evt) {
    if (phase.is(phaseEnum.vscrolling)) return

    var touch = evt.touches[0]
    var gap = touch.pageX - currentX

    if (phase.is(phaseEnum.start) && Math.abs(gap) * 2 < Math.abs(touch.clientY - startY)) {
      phase.or(phaseEnum.vscrolling).rm(phaseEnum.start)
      return
    }

    var _d = gap > 0 ? 1 : -1
    if (direction !== _d) {
      restartX = currentX
      startTime = Date.now()
      direction = _d
    }

    phase.assign(phaseEnum.dragging)
    currentX = touch.pageX

    x = x + gap
    // moveX(main, x)
    moveEx(main, x)

    evt.preventDefault();
  }

  function moveRight () {
    two || hide(current.$next)
    current = current.$prev
    if (!stopR()) {
      moveEx(current.$prev, current.x - width)
      show(current.$prev)
    }
  }

  function moveLeft () {
    two || hide(current.$prev)
    current = current.$next
    if (!stopL()) {
      moveEx(current.$next, current.x + width)
      show(current.$next)
    }
  }

  function onAutoAnimation () {
    if (autoPhase === 0 && -current.x - x > width / 2) {
      autoPhase = 1
      moveLeft()
    }
  }

  function autoSwipePostpone () {
    clearAuto()
    animations.auto = setTimeout(() => {
      autoSwipeImmediate()
    }, AUTO_TIMEOUT)
  }

  function autoSwipeImmediate () {
    autoPhase = 0
    phase.assign(phaseEnum.autoanimating)
    animate(main, x, -current.x - width, MAX_PART, onAutoAnimation, autoSwipePostpone)
    // animate(main, x, x - width, MAX_INTERVAL, onAutoAnimation, autoCallback)
    onEnd(current.$next.$index, current.$next, main, elms)
  }

  function autoSwipe() {
    if (Math.abs(x + current.x) > 3) autoSwipeImmediate()
    else autoSwipePostpone()
  }

  function onTouchEnd (evt) {
    // auto && autoCallback()
    if (phase.is(phaseEnum.vscrolling) && !phase.is(phaseEnum.animating)) return
    phase.assign(phaseEnum.animating)
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
    animate(main, x, to, fast ? FAST_INTERVAL : t, null, auto ? () => autoSwipe() : null)
    // animate(main, x, to, fast ? FAST_INTERVAL : t)

    onEnd(current.$index, current, main, elms)
  }

  function animate (elm, from, to, interval, onAnimation, callback) {
    var start = Date.now()
    function loop () {
      var now = Date.now()
      var during = now - start
      if (during >= interval) x = to
      isFunction(onAnimation) && onAnimation()
      if (during >= interval) {
        // moveX(elm, to)
        moveEx(elm, to)
        !phase.is(phaseEnum.cancelauto) && isFunction(callback) && callback()
        phase.assign(phaseEnum.idle)
        return onanimationEnd(current.$index, current, main, elms)
      }
      var distance = (to - from) * easing[ease](during / interval) + from
      x = distance
      // moveX(elm, distance)
      moveEx(elm, x)
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
      elms[0].$index = elms[2].$index = 0
      elms[1].$index = elms[3].$index = 1
    }
    var one = elms.length === 1
    two = elms.length === 2
    // slides = new Link(elms, needClone ? '0101' : null)
    slides = new Link(elms)
    needClone || elms.forEach((e, i) => e.$index = i)

    moveEx(current, 0)
    one || two || moveEx(current.$prev, -width)
    one || moveEx(current.$next, width)
    elms.forEach(el => {
      el.style.position = 'absolute'
      if (!css) {
        el.style.width = width + 'px'
        el.style.height = height + 'px'
      }
      // el.style.overflow = 'hidden'
      if (!two && !one && el !== current && el !== current.$prev && el !== current.$next) hide(el)
    })

    if (one) return onInit(current.$index, current, main, elms)

    if (!two && !cycle && index === 0) hide(current.$prev)
    if (!two && !cycle && index === elms.length - 1) hide(current.$next)

    destroy()
    on(root, pointerdown, onTouchStart)
    on(root, pointermove, onTouchMove)
    on(root, pointerup, onTouchEnd)

    // stop auto swipe when out of screen
    if (auto) {
      if (observable) {
        raf(() => {
          opts.unobserve = observe(root, function (entries) {
            if (entries && entries[0].intersectionRatio === 0) clearAuto(phase.assign(phaseEnum.cancelauto));
            else autoSwipe();
          })
        })
      } else {
        var evtOpt = passive ? {capture: true, passive: true} : true
        var toggleSwiper = () => inViewport(root) ? autoSwipePostpone() : clearAuto(phase.assign(phaseEnum.cancelauto))
        on(window, 'touchmove', () => clearAuto(phase.assign(phaseEnum.cancelauto)))
        on(window, 'touchend', toggleSwiper)
        toggleSwiper()
      }
    }

    main.x = 0
    onInit(current.$index, current, main, elms)
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
