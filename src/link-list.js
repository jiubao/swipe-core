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

export default LinkList
