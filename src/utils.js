export function on (element, evt, handler) {
  element.addEventListener(evt, handler, false)
}

export function off (element, evt, handler) {
  element.removeEventListener(evt, handler, false)
}

export function isFunction (value) {
  return typeof value === 'function'
}

/* istanbul ignore next */
export const once = function (el, event, fn) {
  var listener = function () {
    if (fn) {
      fn.apply(this, arguments)
    }
    off(el, event, listener)
  }
  on(el, event, listener)
}

function newNode (item) {
  // var node = Object.create(null)
  // node.item = item
  // return node.next = node.prev = node
  return item.next = item.prev = item
}

function LinkList (arr) {
  this.list = []
  // arr.forEach(item => this.append(item))
  arr.forEach((item, index) => {
    item.index = index
    this.append(item)
  })
}

LinkList.prototype.append = function (item) {
  var node = newNode(item)
  this.list.push(node)
  if (!this.tail) {
    return this.head = this.tail = node
  }
  node.prev = this.tail
  node.next = this.tail.next
  this.tail.next = node
  node.next.prev = node
  return this.tail = node
}

// var vendorPrefixes = ['', 'webkit','Moz','ms','O']
// var vendorPrefix = ''
// for (var i = 0; i < 5; i++)
//   if (window[vendorPrefixes[i] + '']) vendorPrefix = vendorPrefixes[i]; break;
// vendorPrefixes.reduce((result, next) => {
//   if (typeof result !== 'undefined') return result
//   if (window[`${next}${next === '' ? 'r' : 'R'}equestAnimationFrame`]) return next
// }, undefined)

// for a 60Hz monitor, requestAnimationFrame will trigger the callback every 16.67ms (1000 / 60 == 16.66...)
var vendorPrefixes = ['webkit','moz','ms','o']
var raf = vendorPrefixes.reduce((result, next) => result || window[`${next}RequestAnimationFrame`], window._requestAnimationFrame)
var caf = vendorPrefixes.reduce((result, next) => result || window[`${next}CancelAnimationFrame`], window._cancelAnimationFrame)
if (!raf || !caf) {
  var last = 0;
  raf = function (fn) {
    var now = +new Date();
    last = Math.max(now, last + 16);
    return setTimeout(fn, last - now)
  }
  caf = clearTimeout
}
window.raf = raf
window.caf = caf

// var requestFrame = vendorPrefixes.reduce((result, next) => {
//   return typeof result !== 'undefined' ? result : window[`${next}RequestAnimationFrame`]
// }, window.requestAnimationFrame)
// window.raf = requestFrame

// for a 60Hz monitor, requestAnimationFrame will trigger the callback every 16.67ms (1000 / 60 == 16.66...)
// todo: for performance concern, add threshold, to control how many times fn will be called in one minute
// var requestFrame = window.requestAnimationFrame
// var cancelFrame = window.cancelAnimationFrame

// if (!requestFrame) {
//   var last = 0
//   requestFrame = function(fn) {
//     var current = Date.now()
//     var last = Math.max(0, 16 - (current - last)) + current
//     return window.setTimeout(fn, last - current)
//   }
//   cancelFrame = clearTimeout
// }

export const cubic = k => --k * k * k + 1

export {LinkList, raf, caf}//, requestFrame, cancelFrame}
