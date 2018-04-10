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

// for a 60Hz monitor, requestAnimationFrame will trigger the callback every 16.67ms (1000 / 60 == 16.66...)
// todo: for performance concern, add threshold, to control how many times fn will be called in one minute
// var ticking = false
// export function requestFrame (fn, giveup) {
//   if (!giveup || !ticking) {
//     window.requestAnimationFrame(() => {
//       ticking = false
//       fn()
//     })
//     ticking = true
//   }
// }
export const requestFrame = window.requestAnimationFrame
export const cancelFrame = window.cancelAnimationFrame

export const cubic = k => --k * k * k + 1

// export const easing = {
//   cubic: {
//     out: function (k) {
//       return --k * k * k + 1;
//     }
//   }
// }

export {LinkList}
