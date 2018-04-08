export function on (element, evt, handler) {
  element.addEventListener(evt, handler, false)
}

export function off (element, evt, handler) {
  element.removeEventListener(evt, handler, false)
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
  arr.forEach(item => this.append(item))
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

export {LinkList}
