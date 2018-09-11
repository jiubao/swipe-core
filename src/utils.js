export function on (element, evt, handler) {
  element.addEventListener(evt, handler, false)
}

export function off (element, evt, handler) {
  element.removeEventListener(evt, handler, false)
}

export function isFunction (value) {
  return typeof value === 'function'
}

function newNode (item) {
  // var node = Object.create(null)
  // node.item = item
  // return node.next = node.prev = node
  return item.next = item.prev = item
}

function LinkList (arr, indexes) {
  this.list = []
  // arr.forEach(item => this.append(item))
  arr.forEach((item, index) => {
    item.index = Number(indexes ? indexes[index] : index)
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

// for a 60Hz monitor, requestAnimationFrame will trigger the callback every 16.67ms (1000 / 60 == 16.66...)
var vendorPrefixes = ['webkit','moz','ms','o']
var raf = vendorPrefixes.reduce((result, next) => result || window[`${next}RequestAnimationFrame`], window.requestAnimationFrame)
var caf = vendorPrefixes.reduce((result, next) => result || window[`${next}CancelAnimationFrame`], window.cancelAnimationFrame)
if (!raf || !caf) {
  var last = 0;
  raf = function (fn) {
    var now = +new Date();
    last = Math.max(now, last + 16);
    return setTimeout(fn, last - now)
  }
  caf = clearTimeout
}
// window.raf = raf
// window.caf = caf

export var easing = {
  cubic: k => --k * k * k + 1,
  // quart: k => 1 - Math.pow(1 - k, 4), // 1 - --k * k * k * k,
  // quint: k => 1 - Math.pow(1 - k, 5),
  // expo: k => k === 1 ? 1 : 1 - Math.pow(2, -10 * k),
  circ: k => Math.sqrt(1 - Math.pow(k - 1, 2))
}

export {LinkList, raf, caf}

// TODO: desktop support, mouse / pointer events
// var touch = 'ontouchstart' in window
// export var pointerdown = touch ? 'touchstart' : 'mousedown'
// export var pointermove = touch ? 'touchmove' : 'mousemove'
// export var pointerup = touch ? 'touchend' : 'mouseup'
export const pointerdown = 'touchstart'
export const pointermove = 'touchmove'
export const pointerup = 'touchend'

export const computedProp = (el, prop) => window.getComputedStyle(el, null).getPropertyValue(prop)
