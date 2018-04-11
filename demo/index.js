var basic = document.getElementById('basic')
var expose = document.getElementById('expose')
var two = document.getElementById('two');
var one = document.getElementById('one');
var uncycle = document.getElementById('uncycle');

var screenWidth = window.screen.width
window['swipe-core']({
  root: basic,
  elms: Array.prototype.slice.apply(basic.children[0].children),
  height: 200,
  auto: true
  // width: window.screen.width
  // cycle: false,
  // index: 0
})

window['swipe-core']({
  root: expose,
  elms: document.querySelectorAll('.swiper-item2'),
  width: 315,
  expose: true,
})

window['swipe-core']({
  root: two,
  elms: Array.prototype.slice.apply(two.children[0].children),
  width: 315,
  height: 230,
  expose: true,
})

window['swipe-core']({
  root: one,
  elms: Array.prototype.slice.apply(one.children[0].children),
  height: 200
})

window['swipe-core']({
  root: uncycle,
  elms: Array.prototype.slice.apply(uncycle.children[0].children),
  height: 200,
  cycle: false
})
