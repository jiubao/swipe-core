import {on, off, once, LinkList, requestFrame, cancelFrame, cubic} from './utils'

var defaultOptions = {
  interval: 400,
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

  var main = root.children[0], hide = document.createElement('div'), animations = {main: -1}, lastGap = 0;
  var x = 0

  /*
   * 0000: stop
   * 0001: dragging
   * 0010: animating
   * 0100: vertical scrolling
   */
  var phase = 0
  var startTime = 0, startX = 0, currentX = 0, startY = 0, currentY = 0, len = elms.length, slides = [], left = 0

  var current = elms[index]
  var prev = () => current.prev
  var next = () => current.next
  // var gap = () => Math.min(Math.max(-width, currentX - startX + lastGap), width)
  var gap = () => currentX - startX + lastGap
  // var animations = []

  init()
  var first = prev(), last = next()

  var tt = 0
  return {
    init
  }

  function onTouchStart (evt) {
    if (phase === 4) return

    if (phase === 2) {
      // while (animations.length) animations.splice(0, 1)[0]()
      cancelFrame(animations.main)
      tt = 1
    }
    phase = 0

    var touch = evt.touches[0]
    startTime = Date.now()
    currentX = startX = touch.pageX
    currentY = startY = touch.clientY
  }

  function onTouchMove (evt) {
    if (phase === 2 || phase === 4) return

    var touch = evt.touches[0]
    var _gap = touch.pageX - currentX
    currentX = touch.pageX
    currentY = touch.clientY
    x = x + _gap

    moveX(main, x)

    evt.preventDefault();
  }

  function _onTouchMove (evt) {
    if (phase === 2 || phase === 4) return

    var touch = evt.touches[0]
    currentX = touch.pageX
    currentY = touch.clientY
    var _gap = gap()
    var right = _gap >= 0

    phase = 1

    // if (phase === 0) {
    //   var x = Math.abs(_gap)
    //   var y = Math.abs(currentY - startY)
    //   if (x * 2 < y) {
    //     phase = 4
    //     return
    //   }
    //
    //   phase = 1
    // }

    evt.preventDefault();

    // left = left + _gap

    console.log('onmove.left: ', left)
    console.log('onmove.lastgap: ', lastGap)
    console.log('onmove.gap: ', _gap)
    moveX(main, left + _gap);
  }

  // 375, 187, 188
  function onTouchEnd (evt) {
    phase = 2
    var cx = current.x + x
    if (cx > 187) {
      hide.appendChild(current.next)
      current = current.prev
      current.prev.x = current.x - width
      moveX(current.prev, current.prev.x)
      main.appendChild(current.prev)
    } else if (cx < -187) {
      hide.appendChild(current.prev)
      current = current.next
      current.next.x = current.x + width
      moveX(current.next, current.next.x)
      main.appendChild(current.next)
    }
    animate(main, x, current.x * -1)
  }

  function _onTouchEnd (evt) {
    return
    if (phase === 4 || phase === 2) return
    phase = 2

    if (tt == 1) {
      console.log('...')
    }

    var _gap = gap()
    if (_gap === 0) return
    var right = _gap >= 0
    lastGap = _gap

    var abort = shouldCancel();
    console.log('end.abort: ', abort)
    var from = _gap + left
    var nextleft = abort ? left : left + width * (right ? 1 : -1);
    animate(main, from, nextleft, callback)

    function callback () {
      console.log('callback....')
      if (!abort) {
        left = nextleft
        hide.appendChild(right ? next() : prev());
        current = current[right ? 'prev' : 'next'];
        var target = right ? prev() : next()
        moveX(target, width * (right ? -1 : 1) - left)
        main.appendChild(target)
      }
      phase = 0;
      lastGap = 0
    }
  }

  function animate (elm, from, to, callback) {
    var start = Date.now()
    function loop () {
      console.log('looping...')
      var now = Date.now()
      var during = now - start
      if (during >= interval) {
        moveX(elm, to)
        callback && callback()
        return
      }
      var distance = (to - from) * cubic(during / interval) + from
      lastGap = distance - left
      x = distance
      moveX(elm, distance)
      animations.main = requestFrame(loop)
    }
    loop()
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
    hide.style.display = 'none'
    document.body.appendChild(hide)
    len = elms.length
    slides = new LinkList(elms)
    elms.forEach((el, i) => {
      switch (el) {
        case current:
          moveX(el, 0)
          el.x = 0
          break;
        case current.prev:
          moveX(el, -width)
          el.x = -width
          break;
        case current.next:
          moveX(el, width)
          el.x = width
          break;
        default:
          hide.appendChild(el)
      }
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

function moveX (el, x) {
  if (!el) return
  el.style.webkitTransition = ''
  el.style.webkitTransform = `translate3d(${x}px, 0, 0)`
}

export default swipeIt
