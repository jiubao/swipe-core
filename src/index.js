import {easing, pointerdown, pointermove, pointerup, computedProp, bitEnum} from './utils'
import {on, off, isFunction, inViewport} from '@jiubao/utils'
import observe, {observable} from './intersect'
import Link from '@jiubao/link'
import {raf, caf} from '@jiubao/raf'
import hook from '@jiubao/hook'

const FAST_THRESHOLD = 120 // threshold to identify fast swipe
const FAST_INTERVAL = 250 // swipe duration in fast mode
const MAX_INTERVAL = 1000 // total swipe duration
const MAX_PART = MAX_INTERVAL * 2 / 3
const AUTO_TIMEOUT = 3000 // auto swipe interval

var events = 'scroll,resize,touchmove'

// quote property name to pervent mangling
var defaultOptions = {
  'auto': false,
  'cycle': true,
  'expose': false,
  'root': null, // required
  'elms': [], // required
  'index': 0,
  'width': window.screen.width, // if css is false, need width & height
  'height': 200,
  'css': false,
  'ease': 'cubic',
  'plugins': []
}

function swipeIt (options) {
  var instance = Object.create(new hook())
  // hidden div to store swipe elements which are out of current three
  var hides = document.createElement('div')
  hides.style.display = 'none'
  document.body.appendChild(hides)

  var opts = {
    ...defaultOptions,
    ...options
  }

  var {index, root, elms, width, height, cycle, expose, auto, css, ease, plugins} = opts

  // plugins.forEach(p => Object.keys(p).forEach(action => opts[action + 'Handlers'].push(p[action])))
  plugins.forEach(p => Object.keys(p).forEach(evt => instance.on(evt, p[evt])))

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
    idle:     0b00000000,
    start:    0b00000001,
    drag:     0b00000010,
    animate:  0b00000100,
    scroll:   0b00001000,
    auto:     0b00010000,
    cancel:   0b00100000
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

  const trigger = evt => instance.trigger(evt, current.$index, current, main, elms)

  // const moveE = el => moveX(el, el.x)
  const moveEx = (el, x) => { el.x = x; moveX(el, x); }
  const hide = el => hides.appendChild(el)

  const show = el => main.appendChild(el)
  const stopR = _ => !cycle && currentX > startX && current === slides.$head
  const stopL = _ => !cycle && currentX <= startX && current === slides.$tail

  var clearAuto = _ => clearTimeout(animations.auto)
  var clearAndCancel = _ => clearAuto(phase.set(phaseEnum.cancel))
  var clearMain = _ => caf(animations.main)
  var clearAnimations = _ => {clearAuto(); clearMain();}

  var running = true

  var offStack = []
  const on2 = (...args) => offStack.push(on.apply(null, args))

  init()

  instance.destroy = destroy
  instance.index = () => current.$index
  instance.stop = () => {running = false}
  instance.start = () => {running = true}

  return instance

  function moveX (el, x) {
    if (!el) return
    el.style.transition = el.style.webkitTransition = ''
    el.style.transform = el.style.webkitTransform = `translate3d(${x}px, 0, 0)`
    trigger('move')
  }

  function onTouchStart (evt) {
    if (!running) return
    clearAnimations()
    phase.or(phaseEnum.start).rm(phaseEnum.scroll)
    direction = 0

    var touch = evt.touches[0]
    startTime = Date.now()
    restartX = currentX = startX = touch.pageX
    startY = touch.clientY
    trigger('start')
  }

  function onTouchMove (evt) {
    if (!running) return
    if (phase.is(phaseEnum.scroll)) return

    var touch = evt.touches[0]
    var gap = touch.pageX - currentX

    // identify vertical scrolling
    if (phase.is(phaseEnum.start) && Math.abs(gap) * 2 < Math.abs(touch.clientY - startY)) {
      phase.or(phaseEnum.scroll).rm(phaseEnum.start)
      return
    }

    var _d = gap > 0 ? 1 : -1
    if (direction !== _d) {
      restartX = currentX
      startTime = Date.now()
      direction = _d
    }

    phase.set(phaseEnum.drag)
    currentX = touch.pageX

    x = x + gap
    // moveX(main, x)
    moveEx(main, x)

    // evt.preventDefault();
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
      if (!running) return
      autoSwipeImmediate()
    }, AUTO_TIMEOUT)
  }

  function autoSwipeImmediate () {
    autoPhase = 0
    phase.set(phaseEnum.auto)
    trigger('start')
    animate(main, x, -current.x - width, MAX_PART, onAutoAnimation, autoSwipePostpone)
    // animate(main, x, x - width, MAX_INTERVAL, onAutoAnimation, autoCallback)
  }

  function autoSwipe() {
    if (Math.abs(x + current.x) > 3) autoSwipeImmediate()
    else autoSwipePostpone()
  }

  function onTouchEnd (evt) {
    if (!running) return
    // auto && autoCallback()
    if (phase.is(phaseEnum.scroll) && !phase.is(phaseEnum.animate) && !phase.is(phaseEnum.auto)) return auto && autoSwipe();
    phase.set(phaseEnum.animate)
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
        !phase.is(phaseEnum.cancel) && isFunction(callback) && callback()
        phase.set(phaseEnum.idle)
        // return onAnimationEnd(current.$index, current, main, elms)
        return trigger('end')
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
    if (elms.length === 0) return instance.trigger('init', -1)

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

    if (one) return trigger('init')

    if (!two && !cycle && index === 0) hide(current.$prev)
    if (!two && !cycle && index === elms.length - 1) hide(current.$next)

    // destroy()
    on2(root, pointerdown, onTouchStart)
    on2(root, pointermove, onTouchMove)
    on2(root, pointerup, onTouchEnd)

    if (auto) {
      // stop auto swipe when out of screen
      if (observable) {
        raf(() => {
          opts.unobserve = observe(root, function (entries) {
            if (entries && entries[0].intersectionRatio === 0) clearAndCancel()
            else autoSwipe()
          })
        })
      } else {
        var toggleSwiper = () => inViewport(root) ? autoSwipePostpone() : clearAndCancel()
        on2(window, 'touchmove', () => inViewport(root) || clearAndCancel())
        on2(window, 'touchend', toggleSwiper)
        toggleSwiper()
      }

      // stop auto swipe when invisible
      // Set the name of the hidden property and the change event for visibility
      var [hidden, visibilitychange] = ['webkit', 'moz', 'ms', '-'].reduce((result, current) => typeof document[result[0]] !== 'undefined' ? result : [current + 'Hidden', current + 'visibilitychange'], ['hidden', 'visibilitychange']);
      // Handle page visibility change
      hidden[0] !== '-' && on2(document, 'visibilitychange', () => {document[hidden] ? clearAndCancel() : autoSwipePostpone()}, false)
    }

    main.x = 0
    trigger('init')
  }

  function destroy () {
    clearAnimations()
    isFunction(opts.unobserve) && opts.unobserve()
    offStack.forEach(fn => fn())
    hides.parentNode && hides.parentNode.removeChild(hides)
    instance.$destroy()
  }
}

export default swipeIt
