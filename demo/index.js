var root1 = document.getElementById('swiper')
var screenWidth = window.screen.width
window['swipe-core']({
  root: root1,
  elms: Array.prototype.slice.apply(root1.children[0].children),
  height: 200,
  // width: window.screen.width
  // cycle: false,
  // index: 0
})

window['swipe-core']({
  root: document.getElementById('swiper2'),
  elms: document.querySelectorAll('.swiper-item2'),
  width: 315,
  expose: true,
})

var root3 = document.getElementById('swiper3');
window['swipe-core']({
  root: root3,
  elms: Array.prototype.slice.apply(root3.children[0].children),
  width: 315,
  height: 230,
  expose: true,
})

var root4 = document.getElementById('swiper4')
window['swipe-core']({
  root: root4,
  elms: Array.prototype.slice.apply(root4.children[0].children),
  height: 200
})
