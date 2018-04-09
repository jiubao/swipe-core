import {on, off, once, LinkList, requestFrame, cancelFrame, cubic} from './utils'

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

  var main = root.children[0], hide = document.createElement('div'), animations = {main: -1}, lastGap = 0

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

    // moveX(main, _gap - current.index * width);
    console.log('onmove.left: ', left)
    console.log('onmove.lastgap: ', lastGap)
    console.log('onmove.gap: ', _gap)
    moveX(main, left + _gap);


    // (expose || right) && moveX(prev(), _gap - width);
    // moveX(current, _gap);
    // (expose || !right) && moveX(next(), _gap + width);
    // expose && moveX(right ? prev().prev : next().next, right ? _gap - 2 * width : _gap + 2 * width);
  }

  function onTouchEnd (evt) {
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
    // animateX(main, left);
    animate(main, from, nextleft, callback)
    // setTimeout(callback, interval)
    // main.appendChild(current.next.next);
    // moveX(current.next.next, current.next.next.index * width)
    // abort || moveX(right ? next() : prev(), 10000);
    //
    // (abort || right) && animateX(prev(), abort ? -width : 0);
    // animateX(current, abort ? 0 : width * (right ? 1 : -1));
    // (abort || !right) && animateX(next(), abort ? width : 0);
    // (expose && !abort) && animateX(right ? prev().prev : next().next, right ? -width : width);

    function callback () {
      console.log('callback....')
      if (!abort) {
        left = nextleft
        hide.appendChild(right ? next() : prev());
        current = current[right ? 'prev' : 'next'];
        var target = right ? prev() : next()
        moveX(target, width * (right ? -1 : 1) - left)
        // moveX(target, target.index * width)
        main.appendChild(target)
      }
      phase = 0;
      lastGap = 0
    }
  }

  // function animateX (el, offset) {
  //   // el.style.webkitTransition = '-webkit-transform 100ms ease-in-out';
  //   el.style.webkitTransition = `-webkit-transform ${interval}ms cubic-bezier(0.22, 0.61, 0.36, 1)`
  //   // use setTimeout 20 instead of requestAnimationFrame
  //   setTimeout(() => el.style.webkitTransform = `translate3d(${offset}px, 0, 0)`, 0)
  //   var called = false
  //   function callback () {
  //     if (called) return
  //     called = true
  //     el.style.webkitTransition = ''
  //   }
  //   once(el, 'webkitTransitionEnd', callback)
  //   var t1 = setTimeout(callback, interval + 20)
  //   animations.push(function () {
  //     clearTimeout(t1)
  //     callback()
  //   })
  // }

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
          break;
        case current.prev:
          moveX(el, -width)
          break;
        case current.next:
          moveX(el, width)
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
