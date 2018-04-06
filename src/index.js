import {on, off} from './utils'

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
  var prev = () => index === 0 && !cycle ? null : elms[index === 0 ? len - 1 : index - 1]
  var next = () => index === len - 1 && !cycle ? null : elms[index === len - 1 ? 0 : index + 1]
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
    var touch = evt.touches[0]
    startTime = Date.now()
    currentX = startX = touch.pageX
    currentY = startY = touch.clientY
  }

  function onTouchMove (evt) {
    var touch = evt.touches[0]
    currentX = touch.pageX
    currentY = touch.clientY
    var _gap = gap()

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

    console.log('gap: ', _gap)
    console.log('width: ', width)
    moveX(prev(), _gap - width)
    moveX(current(), _gap)
    moveX(next(), _gap + width)


  }

  function onTouchEnd () {}

  function animateX () {}

  function shouldCancel () {}

  function init () {
    console.log('init...')

    elms.forEach((el, i) => i !== index && moveX(el, 10000))

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

export default swipeIt
